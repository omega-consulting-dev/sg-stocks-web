import Axios from "./axios.service";
import type { AxiosResponse } from "axios";
import type { User } from "@/types/userTypes";


const login = (data: {email: string, password: string}) : Promise<AxiosResponse<User>> => {
    return Axios.post('/v1/auth/login/', data)
}

export const UserServices = {
    login
}