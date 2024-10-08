export interface ResponseMHSuccess {
  ambiente: string;
  clasificaMsg: string;
  codigoGeneracion: string;
  codigoMsg: string;
  descripcionMsg: string;
  estado: string;
  fhProcesamiento: string;
  observaciones: any[];
  selloRecibido: string;
  version: number;
  versionApp: number;
}

export interface IAddress {
  departamento: string;
  municipio: string;
  complemento: string;
}

export interface ITransmitter {
  clavePrivada: string;
  clavePublica: string;
  claveApi: string;
  nit: string;
  nrc: string;
  nombre: string;
  telefono: string;
  correo: string;
  descActividad: string;
  codActividad: string;
  nombreComercial: string;
  direccion: IAddress;
}

export interface ICartProduct {
  stock: number;
  price: string;
  priceA: string;
  priceB: string;
  priceC: string;
  tipoItem: string;
  productName: string;
  productCode: string;
  quantity: number;
  discount: number;
  porcentaje: number;
  total: number;
  base_price: number;
  fixed_price: number;
  monto_descuento: number;
  porcentaje_descuento: number;
  prices: string[];
}

export interface ICartProductCCFE extends ICartProduct {
  tributos: string[]
}

export interface Customer {
  nombre: string;
  nombreComercial: string;
  nrc: string;
  nit: string;
  tipoDocumento: string;
  numDocumento: string;
  codActividad: string;
  descActividad: string;
  telefono: string;
  correo: string;
  tipoContribuyente: string;
  direccion: IAddress;
}
