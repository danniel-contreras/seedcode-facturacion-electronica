import { AxiosError, CancelTokenSource } from "axios";
import {
  FC_PagosItems,
  SVFE_FC_Firmado,
  SVFE_FC_SEND,
} from "../types/svf_dte/fc.types";
import {
  Customer,
  ICartProduct,
  ITransmitter,
  PayloadMH,
  ResponseMHSuccess,
} from "../types/svf_dte/global";
import { generate_uuid } from "./plugins/uuid";
import { firmar_documento, send_to_mh } from "./services/svfe.service";
import {
  calc_exenta,
  calc_gravada,
  calc_no_grav,
  calc_no_suj,
  calcularDescuento,
  calDiscount,
  convertCurrencyFormat,
  formatearNumero,
  generate_control,
  getElSalvadorDateTime,
  total,
  total_iva,
  total_without_discount,
} from "./settings";
import {
  generate_emisor,
  generate_receptor,
  make_cuerpo_documento_factura,
} from "./utils";

/**
 * Generates a Factura Electronica Venta object based on the given transmitter
 * and establishment and point of sale codes, the next correlative, the
 * products, the customer, the condition, the type of payment, and the
 * environment.
 *
 * @param {ITransmitter} transmitter - The transmitter object.
 * @param {string} codEstable - The code of the establishment.
 * @param {string} codPuntoVenta - The code of the point of sale.
 * @param {string} codEstableMH - The code of the establishment in the MH system.
 * @param {string} codPuntoVentaMH - The code of the point of sale in the MH system.
 * @param {string} tipoEstablecimiento - The type of establishment.
 * @param {number} nextCorrelative - The next correlative.
 * @param {ICartProduct[]} products - The products.
 * @param {Customer} customer - The customer.
 * @param {number} condition - The condition.
 * @param {FC_PagosItems[]} tipo_pago - The type of payment.
 * @param {number} [ivaRete1=0] - The first IVA retention.
 * @param {string} [ambiente="00"] - The environment.
 * @returns {SVFE_FC_SEND} - The Factura Electronica Venta object.
 */
export const generate_factura = (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  products: ICartProduct[],
  customer: Customer,
  condition: number,
  tipo_pago: FC_PagosItems[],
  ivaRete1 = 0,
  ambiente = "00"
): SVFE_FC_SEND => {
  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 1,
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: "01",
        numeroControl: generate_control(
          "01",
          codEstable!,
          codPuntoVenta!,
          formatearNumero(nextCorrelative)
        ),
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      documentoRelacionado: null,
      emisor: {
        ...generate_emisor(
          transmitter,
          codEstable,
          codPuntoVenta,
          codEstableMH,
          codPuntoVentaMH,
          tipoEstablecimiento
        ),
      },
      receptor: { ...generate_receptor(customer) },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: make_cuerpo_documento_factura(products),
      resumen: {
        totalNoSuj: Number(calc_no_suj(products).toFixed(2)),
        totalExenta: Number(calc_exenta(products).toFixed(2)),
        totalGravada: Number(calc_gravada(products).toFixed(2)),
        subTotalVentas: Number(calc_gravada(products).toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: Number(
          calcularDescuento(
            total_without_discount(products),
            total(products)
          ).porcentajeDescuento.toFixed(2)
        ),
        totalDescu: Number(calDiscount(products).toFixed(2)),
        tributos: null,
        subTotal: Number(calc_gravada(products).toFixed(2)),
        ivaRete1: Number(ivaRete1.toFixed(2)),
        reteRenta: 0,
        totalIva: Number(total_iva(products).toFixed(2)),
        montoTotalOperacion: Number(calc_gravada(products).toFixed(2)),
        totalNoGravado: Number(calc_no_grav(products).toFixed(2)),
        totalPagar: Number(
          (
            calc_no_grav(products) +
            calc_exenta(products) +
            calc_no_suj(products) +
            calc_gravada(products) -
            ivaRete1
          ).toFixed(2)
        ),
        totalLetras: convertCurrencyFormat(
          (
            calc_no_grav(products) +
            calc_exenta(products) +
            calc_no_suj(products) +
            calc_gravada(products) -
            ivaRete1
          ).toFixed(2)
        ),
        saldoFavor: 0,
        condicionOperacion: condition,
        pagos: tipo_pago,
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
};


/**
 * Generates a Factura Electrónica object, signs it, and sends it to the MH
 * server. The function returns an object with two properties: `mh`, which
 * contains the response from the MH server, and `firmado`, which contains the
 * signed document.
 *
 * @param {ITransmitter} transmitter - The transmitter object.
 * @param {string} codEstable - The code of the establishment.
 * @param {string} codPuntoVenta - The code of the point of sale.
 * @param {string} codEstableMH - The code of the establishment in the MH system.
 * @param {string} codPuntoVentaMH - The code of the point of sale in the MH system.
 * @param {string} tipoEstablecimiento - The type of establishment.
 * @param {number} nextCorrelative - The next correlative.
 * @param {ICartProduct[]} products - The products.
 * @param {Customer} customer - The customer.
 * @param {number} condition - The condition.
 * @param {FC_PagosItems[]} tipo_pago - The type of payment.
 * @param {number} ivaRete1 - The first IVA retention.
 * @param {string} ambiente - The environment.
 * @param {CancelTokenSource} cancelToken - The cancel token.
 * @param {string} firmador_url - The URL of the firmador service.
 * @param {string} token - The token to use for the MH server.
 * @returns {Promise<{mh: ResponseMHSuccess; firmado: SVFE_FC_Firmado}>} - A
 *  promise that resolves with an object containing the response from the MH
 *  server and the signed document.
 */
export const process_svfe = async (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  products: ICartProduct[],
  customer: Customer,
  condition: number,
  tipo_pago: FC_PagosItems[],
  ivaRete1 = 0,
  ambiente = "00",
  cancelToken: CancelTokenSource,
  firmador_url: string,
  token: string
): Promise<{
  mh: ResponseMHSuccess;
  firmado: SVFE_FC_Firmado;
}> => {
  const data = generate_factura(
    transmitter,
    codEstable,
    codPuntoVenta,
    codEstableMH,
    codPuntoVentaMH,
    tipoEstablecimiento,
    nextCorrelative,
    products,
    customer,
    condition,
    tipo_pago,
    ivaRete1,
    ambiente
  );

  const firma = await firmar_documento(data, firmador_url, cancelToken);

  if (firma.data.body) {
    const payload = {
      ambiente: ambiente,
      idEnvio: 1,
      version: 1,
      tipoDte: "01",
      documento: firma.data.body,
    };

    try {
      const response = await send_to_mh(
        payload,
        ambiente as "00" | "01",
        token,
        cancelToken
      );

      if (response.estado === "RECHAZADO") {
        return {
          mh: response,
          firmado: {} as SVFE_FC_Firmado,
        };
      } else if (response.estado === "PROCESADO") {
        return {
          mh: response,
          firmado: {
            ...data.dteJson,
            respuestaMH: response,
            firma: firma.data.body,
          },
        };
      } else {
        return {
          mh: {
            version: 0,
            ambiente,
            versionApp: 1,
            estado: "RECHAZADO",
            codigoGeneracion: data.dteJson.identificacion.codigoGeneracion,
            selloRecibido: null,
            fhProcesamiento: new Date().toLocaleDateString(),
            clasificaMsg: "0",
            codigoMsg: "0",
            descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
            observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
          },
          firmado: {} as SVFE_FC_Firmado,
        };
      }
    } catch {
      return {
        mh: {
          version: 0,
          ambiente,
          versionApp: 1,
          estado: "RECHAZADO",
          codigoGeneracion: data.dteJson.identificacion.codigoGeneracion,
          selloRecibido: null,
          fhProcesamiento: new Date().toLocaleDateString(),
          clasificaMsg: "0",
          codigoMsg: "0",
          descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
          observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
        },
        firmado: {} as SVFE_FC_Firmado,
      };
    }
  }
  return {
    mh: {
      version: 0,
      ambiente,
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion: data.dteJson.identificacion.codigoGeneracion,
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "FIRMA NO ENCONTRADA",
      observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
    },
    firmado: {} as SVFE_FC_Firmado,
  };
};
