export { generate_factura, process_svfe } from "./utils/svfe_fe";
export { generate_credito_fiscal, process_svccfe, reteRenta } from "./utils/svfe_ccfe";

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

export {
  type IInvalidationToMH,
  type IResponseInvalidationMH,
  SVFE_Invalidacion,
  type Invalidacion_Identificacion,
  type Invalidacion_Documento,
  type Invalidacion_Emisor,
  type Invalidacion_Motivo,
  InvalidationPayload,
} from "./types/svf_dte/invalidation.types";

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
  calc_exenta,
  calcularPrecioDeseado,
  calc_gravada,
  calc_no_suj,
} from "./utils/settings";

export {
  generate_emisor,
  generate_receptor,
  make_cuerpo_documento_factura,
  make_cuerpo_documento_fiscal,
  isResponseMHSuccess,
  isSendMHFailed,
  isResponseMH,
  verifyApplyAnulation,
} from "./utils/utils";

export {
  type Customer,
  type ICartProduct,
  type ITransmitter,
  type ICartProductCCFE,
  type TipoTributo,
  type PayloadMH,
  type ResponseMHSuccess,
  type SendMHFailed,
} from "./types/svf_dte/global";

export {
  firmar_documento,
  send_to_mh,
  check_dte,
} from "./utils/services/svfe.service";

export { MH_DTE, MH_DTE_TEST, CHECK_URL } from "./utils/constants";

export {
  generate_invalidation,
  process_invalidation,
} from "./utils/invalidation";

export { send_invalidation_to_mh } from "./utils/services/invalidation.service";

export {
  generate_excluded_subject,
  generate_subject,
  process_svfse,
} from "./utils/svfe_fse";

export { type ICartProductFSE } from "./types/svf_dte/global";

export {
  type SVFE_FSE_Firmado,
  type SVFE_FSE_SEND,
  type FSE_Apendice,
  type FSE_Cuerpo_Documento,
  type FSE_Identificacion,
  type FSE_Emisor,
  type FSE_Sujeto_Excluido,
  type FSE_Resumen,
  type FSVE_FSE,
} from "./types/svf_dte/fse.types";
