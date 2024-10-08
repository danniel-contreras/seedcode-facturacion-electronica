export { generate_factura } from "./utils/svfe_fe";
export { generate_credito_fiscal } from "./utils/svfe_ccfe";

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

export {
  type SVFE_CF,
  type SVFE_CF_Firmado,
  type SVFE_CF_SEND,
  type CF_ApendiceItems,
  type CF_CuerpoDocumentoItems,
  type CF_DocumentoRelacionadoItems,
  type CF_Emisor,
  type CF_Extension,
  type CF_Identificacion,
  type CF_OtrosDocumentosItems,
  type CF_PagosItems,
  type CF_Receptor,
  type CF_Resumen,
  type CF_TributosItems,
  type CF_VentaTercerosItems,
} from "./types/svf_dte/cf.types";

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
  make_cuerpo_documento_fiscal,
} from "./utils/utils";

export {
  type Customer,
  type ICartProduct,
  type ITransmitter,
  type ICartProductCCFE,
  type TipoTributo,
  type PayloadMH,
  type ResponseMHSuccess,
  type SendMHFailed
} from "./types/svf_dte/global";

export {
  firmar_documento,
  send_to_mh,
  check_dte,
} from "./utils/services/svfe_services";

export { MH_DTE, MH_DTE_TEST, CHECK_URL } from "./utils/contants";
