import { ITransmitter } from "./global";

export interface IInvalidationToMH {
  ambiente: string;
  version: number;
  idEnvio: number;
  documento: string;
}
export interface IResponseInvalidationMH {
  version: number;
  ambiente: string;
  versionApp: number;
  estado: string;
  codigoGeneracion: string;
  selloRecibido: string | null;
  fhProcesamiento: string | null;
  clasificaMsg: null;
  codigoMsg: string;
  descripcionMsg: string;
  observaciones: string[];
}

export class InvalidationPayload {
  transmitter: ITransmitter;
  codEstable: string;
  codPuntoVenta: string;
  tipoEstablecimiento: string;
  nombreEstablecimiento: string;
  codeGeneration: string;
  tipoDte: string;
  document: {
    tipoAnulacion: string;
    motivoAnulacion: string;
    nombreResponsable: string;
    tipDocResponsable: string;
    numDocResponsable: string;
    nombreSolicita: string;
    tipDocSolicita: string;
    numDocSolicita: string;
  };
  customer: {
    tipoDocumento: string;
    numDocumento: string;
    name: string;
  };
  sale: {
    codigoGeneracion: string;
    codigoGeneracionR: string | null;
    selloRecibido: string;
    numeroControl: string;
    fecEmi: string;
    montoIva: string;
  };
  ambiente: "00" | "01";
}

export interface Invalidacion_Identificacion {
  version: number;
  ambiente: "00" | "01";
  codigoGeneracion: string;
  fecAnula: string;
  horAnula: string;
}

export interface Invalidacion_Emisor {
  nit: string;
  nombre: string;
  tipoEstablecimiento: string;
  telefono: string;
  correo: string;
  codEstable: string;
  codPuntoVenta: string;
  nomEstablecimiento: string;
}

export interface Invalidacion_Documento {
  tipoDte: string;
  codigoGeneracion: string;
  codigoGeneracionR: string | null;
  selloRecibido: string;
  numeroControl: string;
  fecEmi: string;
  montoIva: number;
  tipoDocumento: string | null;
  numDocumento: string | null;
  nombre: string;
}

export interface Invalidacion_Motivo {
  tipoAnulacion: number;
  motivoAnulacion: string;
  nombreResponsable: string;
  tipDocResponsable: string;
  numDocResponsable: string;
  nombreSolicita: string;
  tipDocSolicita: string;
  numDocSolicita: string;
}

export class SVFE_Invalidacion {
  nit: string;
  passwordPri: string;
  dteJson: {
    identificacion: Invalidacion_Identificacion;
    emisor: Invalidacion_Emisor;
    documento: Invalidacion_Documento;
    motivo: Invalidacion_Motivo;
  };
}
