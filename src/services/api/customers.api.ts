import Axios from '../axios.service'

export interface Customer {
  id: number
  name: string
  customer_code: string
  email: string
  phone: string
  city: string
}

export const customersApi = {
  async fetchAll(): Promise<Customer[]> {
    const response = await Axios.get('/customers/')
    return response.data
  },

  async fetchById(id: number): Promise<Customer> {
    const response = await Axios.get(`/customers/${id}/`)
    return response.data
  },
}
