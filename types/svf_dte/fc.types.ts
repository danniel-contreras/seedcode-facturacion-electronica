import { ResponseMHSuccess } from "./global";

/** Tipos basados en el schema FE-F v2. */
export type Ambiente = "00" | "01";

export interface FC_Identificacion {
  version: 2;
  ambiente: Ambiente;
  tipoDte: "01";
  numeroControl: string;
  codigoGeneracion: string;
  tipoModelo: 1 | 2;
  tipoOperacion: 1 | 2;
  tipoContingencia: 1 | 2 | 3 | 4 | 5 | null;
  motivoContin: string | null;
  fecEmi: string;
  horEmi: string;
  tipoMoneda: "USD";
}

export interface FC_Direccion {
  departamento: string;
  municipio: string;
  distrito: string;
  complemento: string;
}
export interface FC_DocumentoRelacionadoItems {
  tipoDocumento: string;
  tipoGeneracion: number;
  numeroDocumento: string;
  fechaEmision: string;
}
export interface FC_Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string | null;
  direccion: FC_Direccion;
  telefono: string;
  correo: string;
  codEstable: string | null;
  codPuntoVenta: string | null;
}
export interface FC_Receptor {
  tipoDocumento: string | null;
  numDocumento: string | null;
  nrc: string | null;
  nombre: string | null;
  codActividad: string | null;
  descActividad: string | null;
  direccion: FC_Direccion | null;
  telefono: string | null;
  correo: string | null;
}
export interface FC_Medico {
  nombre: string | null;
  nit: string | null;
  docIdentificacion: string | null;
  tipoServicio: number | null;
}
export interface FC_OtrosDocumentosItems {
  codDocAsociado: number | null;
  descDocumento: string | null;
  detalleDocumento: string | null;
  medico: FC_Medico | null;
}
export interface FC_VentaTercerosItems {
  nit: string | null;
  nombre: string;
  codDomiciliado: number | null;
}
export interface FC_CuerpoDocumentoItems {
  numItem: number;
  tipoItem: number;
  numeroDocumento: string | null;
  cantidad: number;
  codigo: string | null;
  codTributo: string | null;
  uniMedida: number;
  descripcion: string;
  precioUni: number;
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  tributos: string[] | null;
  psv: number;
  noGravado: number;
  ivaItem: number;
}
export interface FC_CuerpoDocumento {
  items: FC_CuerpoDocumentoItems[];
}
export interface FC_TributosItems {
  codigo: string;
  descripcion: string;
  valor: number;
}
export interface FC_PagosItems {
  codigo: string | null;
  montoPago: number;
  referencia: string | null;
  plazo: string | null;
  periodo: number | null;
}
export interface FC_Resumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  porcentajeDescuento: number;
  totalDescu: number;
  tributos: FC_TributosItems[] | null;
  subTotal: number;
  ivaRete: number;
  montoTotalOperacion: number;
  totalNoGravado: number;
  totalPagar: number;
  totalLetras: string | null;
  totalIva: number;
  saldoFavor: number;
  condicionOperacion: number;
  pagos: FC_PagosItems[] | null;
  numPagoElectronico: string | null;
  observaciones: string | null;
}
/** @deprecated FE-F v2 no incluye el nodo extension. */
export interface FC_Extension {
  nombEntrega: string | null;
  docuEntrega: string | null;
  nombRecibe: string | null;
  docuRecibe: string | null;
  observaciones: string | null;
  placaVehiculo: string | null;
}
export interface FC_ApendiceItems {
  campo: string;
  etiqueta: string;
  valor: string;
}
export interface SVFE_FC {
  identificacion: FC_Identificacion;
  documentoRelacionado: FC_DocumentoRelacionadoItems[] | null;
  emisor: FC_Emisor;
  receptor: FC_Receptor | null;
  otrosDocumentos: FC_OtrosDocumentosItems[] | null;
  ventaTercero: FC_VentaTercerosItems | null;
  cuerpoDocumento: FC_CuerpoDocumentoItems[];
  resumen: FC_Resumen;
  apendice: FC_ApendiceItems[] | null;
}
export interface SVFE_FC_Firmado extends SVFE_FC {
  respuestaMH: ResponseMHSuccess;
  firmaElectronica: string;
  selloRecepcion: string | null;
}
export interface SVFE_FC_SEND {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: SVFE_FC;
}
