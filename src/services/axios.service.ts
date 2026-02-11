import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import router from "@/router";
import { useUserStore } from "@/stores/user";

/**
 * Interface pour étendre la configuration de la requête Axios.
 * Ceci permet d'ajouter des propriétés personnalisées comme `_retry` et `skipAuthRefresh`.
 */
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
}

/**
 * Interface pour les éléments de la file d'attente des requêtes en attente.
 */
interface FailedRequest {
    resolve: (value: string | PromiseLike<string>) => void;
    reject: (reason?: any) => void;
}

/**
 * Extrait le nom du tenant depuis le hostname
 * Ex: omega.app.sg-stocks.com → "omega"
 *     app.sg-stocks.com → null (pas de tenant)
 *     santa.localhost → "santa"
 *     localhost → null (super admin)
 */
function getTenantFromHostname(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Pour production : vérifier si c'est un sous-domaine de app.sg-stocks.com
    // Ex: omega.app.sg-stocks.com → ["omega", "app", "sg-stocks", "com"]
    if (parts.length >= 4) {
        // Si c'est *.app.sg-stocks.com (4+ parties avec "app" en position 1)
        if (parts[1] === 'app' && parts[2] === 'sg-stocks' && parts[0] !== 'www') {
            return parts[0]; // "omega"
        }
    }

    // Pour développement local : santa.localhost → ["santa", "localhost"]
    if (parts.length === 2 && parts[1] === 'localhost' && parts[0] !== 'www') {
        return parts[0]; // "santa"
    }

    // Pas de tenant (app.sg-stocks.com, localhost, admin.sg-stocks.com, etc.)
    return null;
}

/**
 * Construit la baseURL dynamiquement en fonction du tenant
 */
function getBaseURL(): string {
    const tenant = getTenantFromHostname();
    const port = import.meta.env.VITE_API_PORT || '8000';
    const baseDomain = import.meta.env.VITE_API_BASE_DOMAIN || 'localhost';

    // Ne pas inclure le port si c'est 80 (HTTP) ou 443 (HTTPS)
    const portSuffix = (port === '80' || port === '443') ? '' : `:${port}`;

    if (tenant) {
        // Tenant spécifique : http://omega.api.sg-stocks.com/api/v1/
        return `http://${tenant}.${baseDomain}${portSuffix}/api/v1`;
    } else {
        // Super admin : http://api.sg-stocks.com/api/v1/
        return `http://${baseDomain}${portSuffix}/api/v1`;
    }
}

// Création de l'instance Axios SANS baseURL statique
const Axios = axios.create({
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 secondes au lieu de 10
    withCredentials: true
})

// Intercepteur de requête - Construit l'URL dynamiquement à CHAQUE requête
Axios.interceptors.request.use(
    (requete) => {
        const userStore = useUserStore()

        // 🔥 CRITIQUE : Recalculer la baseURL dynamiquement selon le hostname actuel
        const dynamicBaseURL = getBaseURL()

        // Si l'URL est relative, la préfixer avec la baseURL dynamique
        if (requete.url && !requete.url.startsWith('http')) {
            requete.url = dynamicBaseURL + requete.url
        }

        // Détecter automatiquement le tenant depuis l'URL
        const tenant = getTenantFromHostname()
        if (tenant && userStore.domain !== tenant) {
            userStore.setDomain(tenant)
        }

        // Ajouter le token d'authentification si disponible
        if (userStore.access_token) {
            requete.headers.Authorization = `Bearer ${userStore.access_token}`
        }

        // Ajouter le header X-Tenant (défense en profondeur)
        if (tenant) {
            requete.headers['X-Tenant'] = tenant
        }

        return requete
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Variables pour la gestion du refresh token
let isRefreshing: boolean = false
let failedQueue: FailedRequest[] = []

/**
 * Traite toutes les requêtes en attente dans la file d'attente.
 * @param error L'erreur à rejeter pour les promesses, ou null si succès.
 * @param token Le nouveau jeton d'accès à résoudre.
 */
const processQueue = (error: AxiosError | null, token: string | null = null): void => {
    failedQueue.forEach(p => {
        error ? p.reject(error) : p.resolve(token as string) // On s'assure que token est une chaîne si pas d'erreur
    })
    failedQueue = []
}

// Intercepteur de réponse
Axios.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (err: AxiosError) => {
        const userStore = useUserStore()
        const originalRequest = err.config as CustomAxiosRequestConfig

        // Gestion des erreurs de réseau (pas de `err.response`)
        if (!err.response) {
            return Promise.reject(err)
        }

        // Éviter la logique de refresh si explicitement demandé
        if (originalRequest?.skipAuthRefresh) {
            return Promise.reject(err)
        }

        // Gestion de l'erreur 401
        if (err.response.status === 401 && !originalRequest._retry) {

            // Si on est déjà en train de refresh, ajouter à la queue
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers = originalRequest.headers || {}
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return Axios(originalRequest)
                }).catch(queueErr => {
                    return Promise.reject(queueErr)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                if (!userStore.refresh_token) {
                    throw new Error('Aucun refresh token disponible')
                }

                const res = await Axios.post<{ access: string }>('/auth/refresh/', {
                    refresh: userStore.refresh_token
                }, { skipAuthRefresh: true } as CustomAxiosRequestConfig)

                const newToken: string = res.data.access

                userStore.setAccessToken(newToken)

                // Mettre à jour l'en-tête de la requête originale et de la queue
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers.Authorization = `Bearer ${newToken}`

                processQueue(null, newToken)

                return Axios(originalRequest)
            } catch (refreshError) {

                // Nettoyer la queue en cas d'erreur
                processQueue(refreshError as AxiosError, null)

                // Nettoyer les données utilisateur et rediriger
                userStore.clearUser()
                router.push({ name: 'login' })

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Gestion d'autres codes d'erreur spécifiques
        const status = err.response?.status
        const errorData = err.response?.data as any
        const errorMessage = errorData?.detail || errorData?.message || err.message

        switch (status) {
            case 403:
                // Afficher un toast pour les erreurs de permission
                const toast = (await import('@/composables/useToast')).useToast()
                toast.error(
                    errorMessage || "Vous n'avez pas les droits nécessaires pour effectuer cette action. Veuillez contacter votre supérieur.",
                    'Accès refusé'
                )
                break
            case 404:
                break
            case 500:
                break
            default:
        }

        return Promise.reject(err)
    }
)

export { Axios }
export default Axios;
