import axios, { CancelTokenSource } from "axios";
import { MH_INVALIDATION, MH_INVALIDATION_TEST } from "../constants";
import {
  IInvalidationToMH,
  IResponseInvalidationMH,
} from "../../types/svf_dte/invalidation.types";

/**
 * Env a la anulaci n de un DTE a la API del Ministerio de Hacienda.
 *
 * @param {IInvalidationToMH} payload - El objeto a enviar.
 * @param {"01"|"00"} [ambiente="00"] - El ambiente, pruebas o productivo.
 * @param {string} token - El token de autenticaci n.
 * @param {CancelTokenSource} cancelToken - Un token para cancelar la solicitud.
 * @returns {Promise<AxiosResponse<IResponseInvalidationMH>>} - La respuesta
 *   de la solicitud, que contiene la respuesta del Ministerio de Hacienda.
 */
export const send_invalidation_to_mh = (
  payload: IInvalidationToMH,
  ambiente: "01" | "00" = "00",
  token: string,
  cancelToken: CancelTokenSource
) => {
  return axios.post<IResponseInvalidationMH>(
    ambiente === "00" ? MH_INVALIDATION_TEST : MH_INVALIDATION,
    {
      ...payload,
    },
    {
      headers: {
        Authorization: token,
      },
      cancelToken: cancelToken.token,
    }
  );
};
