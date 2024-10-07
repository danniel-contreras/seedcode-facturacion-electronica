import { ResponseMHSuccess } from "./global";
import {
    FC_ApendiceItems,
    FC_DocumentoRelacionadoItems,
    FC_Emisor,
    FC_Extension,
    FC_Identificacion,
    FC_OtrosDocumentosItems,
    FC_PagosItems,
    FC_TributosItems,
    FC_VentaTercerosItems,
} from "./fc.types";

export interface CF_Identificacion extends FC_Identificacion { }

export interface CF_DocumentoRelacionadoItems
    extends FC_DocumentoRelacionadoItems { }

export interface CF_Emisor extends FC_Emisor { }

export interface CF_OtrosDocumentosItems extends FC_OtrosDocumentosItems { }

export interface CF_VentaTercerosItems extends FC_VentaTercerosItems { }

export interface CF_Receptor {
    nit: string;
    nrc: string;
    codActividad: string;
    descActividad: string;
    nombreComercial: string | null;
    nombre: string;
    direccion: {
        departamento: string;
        municipio: string;
        complemento: string;
    };
    telefono: string | null;
    correo: string;
}

export interface CF_CuerpoDocumentoItems {
    numItem: number;
    tipoItem: number;
    numeroDocumento: string | null;
    codigo: string | null;
    codTributo: string | null;
    descripcion: string;
    cantidad: number;
    uniMedida: number;
    precioUni: number;
    montoDescu: number;
    ventaNoSuj: number;
    ventaExenta: number;
    ventaGravada: number;
    tributos: string[] | null;
    psv: number;
    noGravado: number;
}

export interface CF_TributosItems extends FC_TributosItems { }

export interface CF_PagosItems extends FC_PagosItems { }

export interface CF_Resumen {
    totalNoSuj: number;
    totalExenta: number;
    totalGravada: number;
    subTotalVentas: number;
    descuNoSuj: number;
    descuExenta: number;
    descuGravada: number;
    porcentajeDescuento: number;
    totalDescu: number;
    tributos: CF_TributosItems[] | null;
    subTotal: number;
    ivaPerci1: number;
    ivaRete1: number;
    reteRenta: number;
    montoTotalOperacion: number;
    totalNoGravado: number;
    totalPagar: number;
    totalLetras: string;
    saldoFavor: number;
    condicionOperacion: number;
    pagos: CF_PagosItems[] | null;
    numPagoElectronico: string | null;
}

export interface CF_Extension extends FC_Extension { }

export interface CF_ApendiceItems extends FC_ApendiceItems { }

export interface SVFE_CF {
    identificacion: CF_Identificacion,
    emisor: CF_Emisor,
    receptor: CF_Receptor,
    otrosDocumentos: CF_OtrosDocumentosItems[] | null,
    ventaTercero: CF_VentaTercerosItems[] | null,
    documentoRelacionado: CF_DocumentoRelacionadoItems[] | null,
    cuerpoDocumento: CF_CuerpoDocumentoItems[],
    resumen: CF_Resumen,
    extension: FC_Extension[] | null,
    apendice: FC_ApendiceItems[] | null
}

export interface SVFE_CF_Firmado extends SVFE_CF {
    respuestaMH: ResponseMHSuccess,
    firma: string
}

export interface SVFE_CF_SEND {
    nit: string,
    activo: boolean,
    passwordPri: string,
    dteJson: SVFE_CF
}