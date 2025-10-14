import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/userTypes'

export const useUserStore = defineStore('user', () => {
	const user = ref<User | null>(null)
	const domain = ref<string | null>(null)
	const access_token = ref<string | null>(localStorage.getItem('accessToken') || null)
	const refresh_token = ref<string | null>(localStorage.getItem('refreshToken') || null)

	// getter
	const isAuthenticated = () => {
		return !!access_token.value
	}

	const isAdmin = () => {
		return !!user.value?.is_staff
	}

	// actions
	const setAccessToken = (token: string) => {
		localStorage.setItem('accessToken', token)
		access_token.value = token
	}

	const setRefreshToken = (token: string) => {
		localStorage.setItem('refreshToken', token)
		refresh_token.value = token
	}

	const clearUser = () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		user.value = null
		access_token.value = null
		refresh_token.value = null
	}

	const setDomain = () => {
		const hostname = window.location.hostname;
		const parts = hostname.split('.');
		if (parts.length >= 2) {
			domain.value = parts[0];
		}
	}

	return {
		user,
		access_token,
		refresh_token,
		domain,

		isAuthenticated,
		isAdmin,

		setAccessToken,
		setRefreshToken,
		clearUser,
		setDomain,
	}
})
