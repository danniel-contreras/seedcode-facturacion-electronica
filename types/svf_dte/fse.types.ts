import { ResponseMHSuccess } from "./global";
import {
  FC_ApendiceItems,
  FC_Identificacion,
  FC_PagosItems,
} from "./fc.types";
export interface FSE_Identificacion extends FC_Identificacion {}

export interface FSE_Emisor {
  nit:string,
  nrc: string,
  nombre: string,
  codActividad: string,
  descActividad: string,
  direccion: {
    departamento: string,
    municipio: string,
    complemento: string
  },
  telefono: string,
  codEstable: string | null,
  codEstableMH: string | null,
  codPuntoVentaMH: string | null,
  codPuntoVenta: string | null
  correo: string
}

export interface FSE_Sujeto_Excluido {
  tipoDocumento: string;
  numDocumento: string;
  nombre: string;
  codActividad: string | null;
  descActividad: string | null;
  direccion: {
    departamento: string;
    municipio: string;
    complemento: string;
  };
  telefono: string | null;
  correo: string | null;
}

export interface FSE_Cuerpo_Documento {
  numItem: number;
  tipoItem: number;
  cantidad: number;
  codigo: string | null;
  uniMedida: number;
  descripcion: string;
  precioUni: number;
  montoDescu: number;
  compra: number;
}

export interface FSE_Resumen {
  totalCompra: number;
  descu: number;
  totalDescu: number;
  subTotal: number;
  ivaRete1: number;
  reteRenta: number;
  totalPagar: number;
  totalLetras: string;
  condicionOperacion: number;
  pagos: FC_PagosItems[] | null;
  observaciones: string | null;
}

export interface FSE_Apendice extends FC_ApendiceItems {}

export interface FSVE_FSE {
  identificacion: FSE_Identificacion;
  emisor: FSE_Emisor;
  sujetoExcluido: FSE_Sujeto_Excluido;
  cuerpoDocumento: FSE_Cuerpo_Documento[];
  resumen: FSE_Resumen;
  apendice: FSE_Apendice[] | null;
}

export interface SVFE_FSE_Firmado extends FSVE_FSE {
  respuestaMH: ResponseMHSuccess;
  firma: string;
}

export interface SVFE_FSE_SEND {
  nit: string;
  activo: boolean;
  passwordPri: string;
  dteJson: FSVE_FSE;
}
