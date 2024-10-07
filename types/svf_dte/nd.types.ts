import { ResponseMHSuccess } from "./global";
import { CF_Receptor } from "./cf.types";
import { FC_ApendiceItems, FC_DocumentoRelacionadoItems, FC_Extension, FC_Identificacion, FC_VentaTercerosItems } from "./fc.types";
import { NC_CuerpoDocumentoItems, NC_Resumen } from "./nc.types";

export interface ND_Identificacion extends FC_Identificacion { }

export interface ND_DocumentoRelacionadoItems extends FC_DocumentoRelacionadoItems { }

export interface ND_Emisor {
    nit: string,
    nrc: string,
    nombre: string,
    codActividad: string,
    descActividad: string,
    nombreComercial: string,
    tipoEstablecimiento: string
    direccion: {
        departamento: string,
        municipio: string,
        complemento: string
    },
    telefono: string,
    correo: string,
}

export interface ND_Receptor extends CF_Receptor { }

export interface ND_VentaTercerosItems extends FC_VentaTercerosItems { }

export interface ND_CuerpoDocumentoItems extends NC_CuerpoDocumentoItems { }

export interface ND_Resumen extends NC_Resumen {
}

export interface ND_Extension extends FC_Extension { }

export interface ND_ApendiceItems extends FC_ApendiceItems { }

export interface SVFE_ND {
    identificacion: ND_Identificacion,
    emisor: ND_Emisor,
    receptor: ND_Receptor,
    ventaTercero: ND_VentaTercerosItems[] | null,
    documentoRelacionado: ND_DocumentoRelacionadoItems[] | null,
    cuerpoDocumento: NC_CuerpoDocumentoItems[],
    resumen: NC_Resumen,
    extension: FC_Extension[] | null,
    apendice: FC_ApendiceItems[] | null
}

export interface SVFE_ND_Firmado extends SVFE_ND {
    respuestaMH: ResponseMHSuccess,
    firma: string
}

export interface SVFE_ND_SEND {
    nit: string,
    activo: boolean,
    passwordPri: string,
    dteJson: SVFE_ND
}