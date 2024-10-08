import { SVFE_CF_SEND } from "../../types/svf_dte/cf.types";
import { SVFE_FC_SEND } from "../../types/svf_dte/fc.types";
import axios, {
  AxiosError,
  AxiosResponse,
  CancelToken,
  CancelTokenSource,
} from "axios";
import { CHECK_URL, MH_DTE, MH_DTE_TEST } from "../contants";
import {
  ICheckPayload,
  ICheckResponse,
  PayloadMH,
  ResponseMHSuccess,
  SendMHFailed,
} from "../../types/svf_dte/global";

/**
 * Firma un documento con la autoridad certificadora del Ministerio de
 * Hacienda.
 *
 * @param {SVFE_CF_SEND | SVFE_FC_SEND} data - El objeto a ser firmado.
 * @param {string} url - La URL del servicio de firma.
 * @param {CancelToken} cancelToken - Un token para cancelar la solicitud.
 * @returns {Promise<AxiosResponse<{ body: string }>>} - La respuesta de la
 *   solicitud, que contiene el documento firmado.
 */
export const firmar_documento = (
  data: SVFE_CF_SEND | SVFE_FC_SEND,
  url: string,
  cancelToken: CancelTokenSource
): Promise<AxiosResponse<{ body: string }>> => {
  return axios.post<{ body: string }>(url, data, {
    cancelToken: cancelToken.token,
  });
};

/**
 * Enviar un documento electrónico a la autoridad certificadora del
 * Ministerio de Hacienda.
 *
 * @param {PayloadMH} payload - El objeto a ser enviado.
 * @param {string} ambiente - El ambiente en el que se envía el documento.
 *   Puede ser "01" para producción o "00" para pruebas.
 * @param {string} token - El token de autenticación del usuario.
 * @param {CancelToken} cancelToken - Un token para cancelar la solicitud.
 * @returns {Promise<{ error: boolean; message: string; code: number } |
 *   ResponseMHSuccess | SendMHFailed>} - La respuesta de la solicitud, que
 *   puede ser un objeto de error, un objeto de respuesta exitosa o un objeto
 *   de respuesta de error.
 */
export const send_to_mh = async (
  payload: PayloadMH,
  ambiente: "01" | "00",
  token: string,
  cancelToken: CancelTokenSource
): Promise<
  | ResponseMHSuccess
  | SendMHFailed
  | { error: boolean; message: string; code: number }
> => {
  try {
    const response = await axios.post<ResponseMHSuccess>(
      ambiente === "00" ? MH_DTE_TEST : MH_DTE,
      payload,
      {
        headers: {
          Authorization: token,
        },
        cancelToken: cancelToken.token,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<SendMHFailed>;

    if (axiosError.response) {
      return axiosError.response.data; // Devolver la estructura del error
    }

    // Manejar otros tipos de errores, si los hay (errores de red, tiempo de espera, etc.)
    return {
      error: true,
      message: axiosError.message,
      code: axiosError.code ? parseInt(axiosError.code) : 500,
    };
  }
};

/**
 * Verifica el estado de un Documento Tributario Electr nico.
 *
 * @param {ICheckPayload} payload - El objeto con los datos del DTE a
 *   verificar.
 * @param {string} token - El token de autenticaci n para el servicio.
 * @returns {Promise<AxiosResponse<ICheckResponse>>} - La respuesta de la
 *   solicitud, que contiene el resultado de la verificaci n.
 */
export const check_dte = (payload: ICheckPayload, token: string) => {
  return axios.post<ICheckResponse>(
    CHECK_URL,
    {
      ...payload,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );
};
