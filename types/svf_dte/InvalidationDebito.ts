import { ResponseMHSuccess } from './global';

export interface SVFE_Invalidacion_Identificacion {
  version: number;
  ambiente: string;
  codigoGeneracion: string;
  fecAnula: string;
  horAnula: string;
}

export interface SVFE_Invalidacion_Emisor {
  nit: string;
  nombre: string;
  tipoEstablecimiento: string;
  telefono: string;
  correo: string;
  codEstable: null | string;
  codPuntoVenta: null | string;
  nomEstablecimiento: string;
}

export interface SVFE_Invalidacion_Documento {
  tipoDte: string;
  codigoGeneracion: string;
  codigoGeneracionR: null | string;
  selloRecibido: string;
  numeroControl: string;
  fecEmi: string;
  montoIva: number;
  tipoDocumento: string;
  numDocumento: string;
  nombre: string;
}

export interface SVFE_Invalidacion_Motivo {
  tipoAnulacion: number;
  motivoAnulacion: string;
  nombreResponsable: string;
  tipDocResponsable: string;
  numDocResponsable: string;
  nombreSolicita: string;
  tipDocSolicita: string;
  numDocSolicita: string;
}

export interface SVFE_Invalidacion {
  identificacion: SVFE_Invalidacion_Identificacion;
  emisor: SVFE_Invalidacion_Emisor;
  documento: SVFE_Invalidacion_Documento;
  motivo: SVFE_Invalidacion_Motivo;
}

export interface SVFE_InvalidacionDebito_SEND {
  nit: string;
  passwordPri: string;
  dteJson: SVFE_Invalidacion;
}

export interface SVFE_Invalidacion_Firmado extends SVFE_Invalidacion {
  respuestaMH: ResponseMHSuccess;
  firma: string;
}

export interface IInvalidationToMH {
  ambiente: string;
  version: number;
  idEnvio: number;
  documento: string;
}

export interface ErrorMHInvalidation {
  ambiente: string;
  clasificaMsg: string;
  codigoGeneracion: string | null;
  codigoMsg: string;
  descripcionMsg: string;
  estado: string;
  fhProcesamiento: string;
  observaciones: string[];
  selloRecibido: string | null;
  version: number;
  versionApp: number;
}
