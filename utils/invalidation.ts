import axios, { AxiosError } from "axios";
import {
  InvalidationPayload,
  SVFE_Invalidacion,
} from "../types/svf_dte/invalidation.types";
import { getElSalvadorDateTime } from "./settings";
import { convertToNull } from "./utils";
import { firmar_documento } from "./services/svfe.service";
import { ResponseMHSuccess } from "../types/svf_dte/global";
import { send_invalidation_to_mh } from "./services/invalidation.service";

/**
 * Esta función genera un objeto SVFE_Invalidacion con los datos proporcionados en el payload.
 * @param {InvalidationPayload} payload - El objeto que contiene la información necesaria para generar la invalidación.
 *   - transmitter: El emisor de la transacción.
 *   - codEstable: El código del establecimiento.
 *   - codPuntoVenta: El código del punto de venta.
 *   - tipoEstablecimiento: El tipo de establecimiento.
 *   - nombreEstablecimiento: El nombre del establecimiento.
 *   - tipoDte: El tipo de documento tributario electrónico.
 *   - document: El objeto que contiene los detalles del documento para anular.
 *   - customer: El cliente involucrado en la transacción.
 *   - sale: El objeto que contiene los detalles de la venta.
 * @returns {SVFE_Invalidacion} - El objeto de invalidación generado.
 */
export const generate_invalidation = (
  payload: InvalidationPayload
): SVFE_Invalidacion => {
  const {
    transmitter,
    codEstable,
    codPuntoVenta,
    tipoEstablecimiento,
    nombreEstablecimiento,
    tipoDte,
    document,
    customer,
    sale,
    ambiente = "00",
  } = payload;

  return {
    nit: transmitter.nit,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 2,
        ambiente: ambiente,
        codigoGeneracion: sale.codigoGeneracion,
        fecAnula: getElSalvadorDateTime().fecEmi,
        horAnula: getElSalvadorDateTime().horEmi,
      },
      emisor: {
        nit: transmitter.nit,
        nombre: transmitter.nombre,
        tipoEstablecimiento: tipoEstablecimiento,
        telefono: transmitter.telefono,
        correo: transmitter.correo,
        codEstable: codEstable,
        codPuntoVenta: codPuntoVenta,
        nomEstablecimiento: nombreEstablecimiento,
      },
      documento: {
        tipoDte: tipoDte,
        codigoGeneracion: sale.codigoGeneracion,
        codigoGeneracionR: convertToNull(sale.codigoGeneracionR),
        selloRecibido: sale.selloRecibido,
        numeroControl: sale.numeroControl,
        fecEmi: sale.fecEmi,
        montoIva: Number(sale.montoIva),
        tipoDocumento: convertToNull(customer.tipoDocumento),
        numDocumento: convertToNull(customer.numDocumento),
        nombre: customer.name,
      },
      motivo: {
        tipoAnulacion: Number(document.tipoAnulacion),
        motivoAnulacion: document.motivoAnulacion,
        nombreResponsable: document.nombreResponsable,
        tipDocResponsable: document.tipDocResponsable,
        numDocResponsable: document.numDocResponsable,
        nombreSolicita: document.nombreSolicita,
        tipDocSolicita: document.tipDocSolicita,
        numDocSolicita: document.numDocSolicita,
      },
    },
  };
};

export const process_invalidation = async (
  invalidation: InvalidationPayload,
  firmador_url: string,
  token: string
) => {
  try {
    const { ambiente = "00" } = invalidation;
    const data = generate_invalidation(invalidation);

    const cancelToken = axios.CancelToken.source();

    const timeOutFirma = setTimeout(() => {
      cancelToken.cancel();
    }, 20000);

    return firmar_documento(data, firmador_url, cancelToken)
      .then((response) => {
        clearTimeout(timeOutFirma);

        if (response.data.body) {
          const mhCancelToken = axios.CancelToken.source();

          const timeOutMH = setTimeout(() => {
            mhCancelToken.cancel();
          }, 20000);

          const payload = {
            version: 2,
            idEnvio: 1,
            ambiente,
            documento: response.data.body,
          };

          return send_invalidation_to_mh(
            payload,
            ambiente,
            token,
            mhCancelToken
          )
            .then(({ data }) => {
              clearTimeout(timeOutMH);
              return data;
            })
            .catch(
              (error: AxiosError<ResponseMHSuccess, ResponseMHSuccess>) => {
                clearTimeout(timeOutMH);

                if (
                  (error as AxiosError<ResponseMHSuccess>).response.data
                    .estado &&
                  (error as AxiosError<ResponseMHSuccess>).response.data
                    .estado === "RECHAZADO"
                ) {
                  return (error as AxiosError<ResponseMHSuccess>).response.data;
                }
                if (axios.isCancel(error)) {
                  clearTimeout(timeOutMH);
                  return {
                    version: 0,
                    ambiente,
                    versionApp: 1,
                    estado: "RECHAZADO",
                    codigoGeneracion:
                      data.dteJson.identificacion.codigoGeneracion,
                    selloRecibido: null,
                    fhProcesamiento: new Date().toLocaleDateString(),
                    clasificaMsg: "0",
                    codigoMsg: "0",
                    descripcionMsg: "TIEMPO DE RESPUESTA EXCEDIDO",
                    observaciones: ["SE TERMINO EL TIEMPO DE RESPUESTA"],
                  } as ResponseMHSuccess;
                }

                return {
                  version: 0,
                  ambiente,
                  versionApp: 1,
                  estado: "RECHAZADO",
                  codigoGeneracion:
                    data.dteJson.identificacion.codigoGeneracion,
                  selloRecibido: null,
                  fhProcesamiento: new Date().toLocaleDateString(),
                  clasificaMsg: "0",
                  codigoMsg: "0",
                  descripcionMsg: "ERROR AL PROCESAR EN MINISTERIO DE HACIENDA",
                  observaciones: ["SE TERMINO EL TIEMPO DE RESPUESTA"],
                } as ResponseMHSuccess;
              }
            );
        }
      })
      .catch((error: AxiosError) => {
        if (axios.isCancel(error)) {
          clearTimeout(timeOutFirma);
          return {
            version: 0,
            ambiente,
            versionApp: 1,
            estado: "RECHAZADO",
            codigoGeneracion: data.dteJson.identificacion.codigoGeneracion,
            selloRecibido: null,
            fhProcesamiento: new Date().toLocaleDateString(),
            clasificaMsg: "0",
            codigoMsg: "0",
            descripcionMsg: "TIEMPO DE RESPUESTA EXCEDIDO",
            observaciones: ["SE TERMINO EL TIEMPO DE RESPUESTA"],
          } as ResponseMHSuccess;
        }

        clearTimeout(timeOutFirma);
        return {
          version: 0,
          ambiente,
          versionApp: 1,
          estado: "RECHAZADO",
          codigoGeneracion: data.dteJson.identificacion.codigoGeneracion,
          selloRecibido: null,
          fhProcesamiento: new Date().toLocaleDateString(),
          clasificaMsg: "0",
          codigoMsg: "0",
          descripcionMsg: "NO SE PUDO FIRMAR",
          observaciones: ["NO SE ENCONTRÓ EL SISTEMA DE FIRMAS"],
        } as ResponseMHSuccess;
      });
  } catch (error) {
    return {
      version: 0,
      ambiente: invalidation.ambiente || "00",
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion: "0",
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "ERROR AL PROCESAR EN MINISTERIO DE HACIENDA",
      observaciones: ["SE TERMINO EL TIEMPO DE RESPUESTA"],
    } as ResponseMHSuccess;
  }
};
