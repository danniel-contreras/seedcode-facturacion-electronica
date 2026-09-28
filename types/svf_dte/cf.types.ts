import { ResponseMHSuccess } from "./global";
import {
  Ambiente,
  FC_ApendiceItems,
  FC_Direccion,
  FC_DocumentoRelacionadoItems,
  FC_Medico,
  FC_OtrosDocumentosItems,
  FC_PagosItems,
  FC_TributosItems,
  FC_VentaTercerosItems,
} from "./fc.types";

/** Tipos basados en el schema FE-CCF v4. */
export interface CF_Identificacion {
  version: 4;
  ambiente: Ambiente;
  tipoDte: "03";
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
export interface CF_DocumentoRelacionadoItems extends FC_DocumentoRelacionadoItems {}
export interface CF_Emisor {
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
export interface CF_Receptor {
  nit: string;
  nrc: string | null;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string | null;
  direccion: FC_Direccion;
  telefono: string | null;
  correo: string | null;
}
export interface CF_OtrosDocumentosItems extends Omit<
  FC_OtrosDocumentosItems,
  "medico"
> {
  medico: (FC_Medico & { tipoServicio: number }) | null;
}
export interface CF_VentaTercerosItems extends FC_VentaTercerosItems {}
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
export interface CF_TributosItems extends FC_TributosItems {}
export interface CF_PagosItems extends FC_PagosItems {}
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
  ivaPerci: number;
  ivaRete: number;
  montoTotalOperacion: number;
  totalNoGravado: number;
  totalPagar: number;
  totalLetras: string | null;
  saldoFavor: number;
  condicionOperacion: number;
  pagos: CF_PagosItems[] | null;
  numPagoElectronico: string | null;
  observaciones: string | null;
}
/** @deprecated FE-CCF v4 no incluye el nodo extension. */
export interface CF_Extension {
  nombEntrega: string | null;
  docuEntrega: string | null;
  nombRecibe: string | null;
  docuRecibe: string | null;
  observaciones: string | null;
  placaVehiculo: string | null;
}
export interface CF_ApendiceItems extends FC_ApendiceItems {}
export interface SVFE_CF {
  identificacion: CF_Identificacion;
  documentoRelacionado: CF_DocumentoRelacionadoItems[] | null;
  emisor: CF_Emisor;
  receptor: CF_Receptor;
  otrosDocumentos: CF_OtrosDocumentosItems[] | null;
  ventaTercero: CF_VentaTercerosItems | null;
  cuerpoDocumento: CF_CuerpoDocumentoItems[];
  resumen: CF_Resumen;
  apendice: CF_ApendiceItems[] | null;
}
export interface SVFE_CF_Firmado extends SVFE_CF {
  respuestaMH: ResponseMHSuccess;
  firma: string;
}
export interface SVFE_CF_SEND {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: SVFE_CF;
}
