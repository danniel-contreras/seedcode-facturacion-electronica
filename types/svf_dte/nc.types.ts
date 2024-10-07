import { ResponseMHSuccess } from './global';
import { CF_Receptor, CF_TributosItems } from './cf.types';
import {
  FC_ApendiceItems,
  FC_DocumentoRelacionadoItems,
  FC_Extension,
  FC_Identificacion,
  FC_VentaTercerosItems,
} from './fc.types';

export interface NC_Identificacion extends FC_Identificacion {}

export interface NC_DocumentosRelaciondos extends FC_DocumentoRelacionadoItems {}

export interface NC_Emisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial: string;
  tipoEstablecimiento: string;
  direccion: {
    departamento: string;
    municipio: string;
    complemento: string;
  };
  telefono: string;
  correo: string;
}

export interface NC_Receptor extends CF_Receptor {}

export interface NC_VentaTercero extends FC_VentaTercerosItems {}

export interface NC_CuerpoDocumentoItems {
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
}

export interface NC_Resumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  totalDescu: number;
  tributos: CF_TributosItems[];
  subTotal: number;
  ivaPerci1: number;
  ivaRete1: number;
  reteRenta: number;
  montoTotalOperacion: number;
  totalLetras: string;
  condicionOperacion: number;
}

export interface NC_Extension extends FC_Extension {}

export interface NC_Apendice extends FC_ApendiceItems {}

export interface SVFE_NC {
  identificacion: NC_Identificacion;
  emisor: NC_Emisor;
  receptor: NC_Receptor;
  ventaTercero: NC_VentaTercero[] | null;
  documentoRelacionado: NC_DocumentosRelaciondos[] | null;
  cuerpoDocumento: NC_CuerpoDocumentoItems[];
  resumen: NC_Resumen;
  extension: FC_Extension[] | null;
  apendice: FC_ApendiceItems[] | null;
}

export interface SVFE_NC_Firmado extends SVFE_NC {
  respuestaMH: ResponseMHSuccess;
  firma: string;
}

export interface SVFE_NC_SEND {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: SVFE_NC;
}
