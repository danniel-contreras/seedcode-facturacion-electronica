import { SVFE_CF_SEND } from "../../types/svf_dte/cf.types";
import { SVFE_FC_SEND } from "../../types/svf_dte/fc.types";
import axios, {
  AxiosError,
  AxiosResponse,
  CancelToken,
  CancelTokenSource,
} from "axios";
import { CHECK_URL, MH_DTE, MH_DTE_TEST } from "../constants";
import {
  ICheckPayload,
  ICheckResponse,
  PayloadMH,
  ResponseMHSuccess,
  SendMHFailed,
} from "../../types/svf_dte/global";
import { SVFE_Invalidacion } from "../../types/svf_dte/invalidation.types";

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
  data: SVFE_CF_SEND | SVFE_FC_SEND | SVFE_Invalidacion,
  url: string,
  cancelToken: CancelTokenSource
): Promise<AxiosResponse<{ body: string }>> => {
  return axios.post<{ body: string }>(url, data, {
    cancelToken: cancelToken.token,
  });
};

/**
 * Description placeholder
 *
 * @async
 * @param {PayloadMH} payload
 * @param {("01" | "00")} ambiente
 * @param {string} token
 * @param {CancelTokenSource} cancelToken
 * @returns {Promise<ResponseMHSuccess>}
 */
export const send_to_mh = async (
  payload: PayloadMH,
  ambiente: "01" | "00",
  token: string,
  cancelToken: CancelTokenSource
): Promise<ResponseMHSuccess> => {
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
    const axiosError = error as AxiosError<ResponseMHSuccess>;

    if (axiosError.response) {
      return axiosError.response.data; // Devolver la estructura del error
    }

    // Manejar otros tipos de errores, si los hay (errores de red, tiempo de espera, etc.)
    return {
      version: 0,
      ambiente,
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion: "N/A",
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "EL SISTEMA DE TRANSMISIÓN DE DTE NO RESPONDIÓ",
      observaciones: ["NO SE OBTUVO RESPUESTA DEL EL MINISTERIO DE HACIENDA"],
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
