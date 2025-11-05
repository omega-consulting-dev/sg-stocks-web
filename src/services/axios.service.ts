import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import router from "@/router"; 
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore()

/**
 * Interface pour étendre la configuration de la requête Axios.
 * Ceci permet d'ajouter des propriétés personnalisées comme `_retry` et `skipAuthRefresh`.
 */
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
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

// Création de l'instance Axios
const Axios = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 10000,
    withCredentials: true,
    headers: {
        'X-Tenant': userStore.domain
    }
})

// Intercepteur de requête
Axios.interceptors.request.use(
    (requete: AxiosRequestConfig) => {
        const user = useUserStore()
        
        requete.headers = requete.headers || {}
        
        if (user.access_token) {
            requete.headers.Authorization = `Bearer ${user.access_token}`
        }
        
        return requete
    },
    (error: AxiosError) => {
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
            console.error('Erreur réseau:', err.message)
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
                console.error('Erreur lors du refresh du token:', refreshError)
                
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
        const errorMessage = (err.response?.data as any)?.message || err.message

        switch (status) {
            case 403:
                console.error('Accès interdit')
                break
            case 404:
                console.error('Ressource non trouvée')
                break
            case 500:
                console.error('Erreur serveur interne')
                break
            default:
                console.error('Erreur API:', status, errorMessage)
        }

        return Promise.reject(err)
    }
)

export default Axios;