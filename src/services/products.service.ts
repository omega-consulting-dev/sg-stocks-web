import Axios from "./axios.service";
import type { AxiosResponse } from "axios";


const exportExcel = () : Promise<AxiosResponse<any>> => {
    return Axios.get('/v1/products/products/export_excel/', {
        responseType: 'blob'
    })
}

const exportPdf = () : Promise<AxiosResponse<any>> => {
    return Axios.get('/v1/products/products/export_pdf/', {
        responseType: 'blob'
    })
}

const importExcel = (file: File) : Promise<AxiosResponse<any>> => {
    return Axios.post('/v1/products/products/import_excel/', file)
}

export const ProductServices = {
    exportExcel,
    exportPdf,
    importExcel,
}
