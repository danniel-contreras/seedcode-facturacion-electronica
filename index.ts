export { generate_factura } from "./utils/svfe_fe";
export {
  type SVFE_FC,
  type SVFE_FC_SEND,
  type SVFE_FC_Firmado,
  type FC_ApendiceItems,
  type FC_CuerpoDocumento,
  type FC_CuerpoDocumentoItems,
  type FC_DocumentoRelacionadoItems,
  type FC_Emisor,
  type FC_Extension,
  type FC_Identificacion,
  type FC_OtrosDocumentosItems,
  type FC_PagosItems,
  type FC_Receptor,
  type FC_Resumen,
  type FC_TributosItems,
  type FC_VentaTercerosItems,
} from "./types/svf_dte/fc.types";

export { generate_uuid } from "./utils/plugins/uuid";

export {
  calcularDescuento,
  calDiscount,
  convertCurrencyFormat,
  formatearNumero,
  generate_control,
  getElSalvadorDateTime,
  total,
  total_iva,
  total_without_discount,
} from "./utils/settings";

export {
  generate_emisor,
  generate_receptor,
  make_cuerpo_documento_factura,
} from "./utils/utils";

export {
  type Customer,
  type ICartProduct,
  type ITransmitter,
} from "./types/svf_dte/global";
