import { ResponseMHSuccess } from "./global"

export interface FC_Identificacion {
    version: number,
    ambiente: string
    tipoDte: string,
    numeroControl: string,
    codigoGeneracion: string,
    tipoModelo: number,
    tipoOperacion: number,
    tipoContingencia: number | null,
    motivoContin: string | null,
    fecEmi: string,
    horEmi: string,
    tipoMoneda: string
}

export interface FC_DocumentoRelacionadoItems {
    tipoDocumento: string,
    tipoGeneracion: number,
    numeroDocumento: string,
    fechaEmision: string
}

export interface FC_Emisor {
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
    codEstableMH: string | null,
    codPuntoVentaMH: string | null
    codEstable: string | null
    codPuntoVenta: string | null
}

export interface FC_Receptor {
    tipoDocumento: string | null,
    numDocumento: string | null,
    nrc: string | null,
    nombre: string | null,
    codActividad: string | null,
    descActividad: string | null,
    direccion: {
        departamento: string,
        municipio: string,
        complemento: string
    } | null,
    telefono: string | null,
    correo: string | null
}

export interface FC_OtrosDocumentosItems {
    codDocAsociado: number,
    descDocumento: string,
    detalleDocumento: string,
    medico: {
        nombre: string,
        nit: string | null,
        docIdentificacion: string,
        tipoServicio: number
    } | null
}
export interface FC_VentaTercerosItems {
    nit: string,
    nombre: string
}


export interface FC_CuerpoDocumentoItems{
    numItem: number,
    tipoItem: number,
    numeroDocumento: string | null,
    cantidad: number,
    codigo: string | null,
    codTributo: string | null,
    uniMedida: number,
    descripcion: string,
    precioUni: number,
    montoDescu: number,
    ventaNoSuj: number,
    ventaExenta: number,
    ventaGravada: number,
    tributos: string[] | null,
    psv: number,
    noGravado: number
    ivaItem: number
}

export interface FC_CuerpoDocumento {
    items: FC_CuerpoDocumentoItems[]
}

export interface FC_TributosItems {
    codigo: string,
    descripcion: string,
    valor: number
}

export interface FC_PagosItems{
    codigo: string,
    montoPago: number,
    referencia: string | null,
    plazo: string | null,
    periodo: number | null
}

export interface FC_Resumen {
    totalNoSuj: number,
    totalExenta: number,
    totalGravada: number,
    subTotalVentas: number,
    descuNoSuj: number,
    descuExenta: number,
    descuGravada: number,
    porcentajeDescuento: number,
    totalDescu: number,
    tributos: FC_TributosItems[] | null,
    subTotal: number,
    ivaRete1: number,
    reteRenta: number,
    montoTotalOperacion: number,
    totalNoGravado: number,
    totalPagar: number,
    totalLetras: string,
    totalIva: number,
    saldoFavor: number
    condicionOperacion: number
    pagos: FC_PagosItems[] | null,
    numPagoElectronico: string | null
}

export interface FC_Extension {
    nombEntrega: string | null,
    docuEntrega: string | null,
    nombRecibe: string | null,
    docuRecibe: string | null,
    observaciones: string | null,
    placaVehiculo: string | null
}

export interface FC_ApendiceItems {
    nombre: string,
    etiqueta: string,
    valor: string
}

export interface SVFE_FC {
    identificacion: FC_Identificacion,
    emisor: FC_Emisor,
    receptor: FC_Receptor,
    otrosDocumentos: FC_OtrosDocumentosItems[] | null,
    ventaTercero: FC_VentaTercerosItems[] | null,
    documentoRelacionado: FC_DocumentoRelacionadoItems[] | null,
    cuerpoDocumento: FC_CuerpoDocumentoItems[],
    resumen: FC_Resumen,
    extension: FC_Extension[] | null,
    apendice: FC_ApendiceItems[] | null
}

export interface SVFE_FC_Firmado extends SVFE_FC {
    respuestaMH: ResponseMHSuccess,
    firma: string
}


export interface SVFE_FC_SEND {
    nit: string,
    activo: boolean,
    passwordPri: string,
    dteJson: SVFE_FC
}