import { CancelTokenSource } from "axios";
import {
  CF_PagosItems,
  CF_Receptor,
  SVFE_CF_Firmado,
  SVFE_CF_SEND,
} from "../types/svf_dte/cf.types";
import {
  ICartProduct,
  ITransmitter,
  ResponseMHSuccess,
  TipoTributo,
} from "../types/svf_dte/global";
import { generate_uuid } from "./plugins/uuid";
import { firmar_documento, send_to_mh } from "./services/svfe.service";
import {
  add_iva,
  calc_gravada,
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
import { generate_emisor, make_cuerpo_documento_fiscal } from "./utils";

/**
 * Generates a Crédito Fiscal Electrónico object based on the given transmitter
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
 * @param {CF_Receptor} receptor - The customer.
 * @param {ICartProduct[]} products_carts - The products.
 * @param {CF_PagosItems[]} tipo_pago - The type of payment.
 * @param {number} retencion - The first IVA retention.
 * @param {number} condition - The condition.
 * @param {string} [ambiente="00"] - The environment.
 * @param {TipoTributo} [tributo=TipoTributo.IVA] - The type of tax.
 * @param {number} [rete=0] - The first tax.
 * @param {boolean} [includeIva=false] - Whether to include IVA in the total.
 * @returns {SVFE_CF_SEND} - The Crédito Fiscal Electrónico object.
 */
export const generate_credito_fiscal = (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  receptor: CF_Receptor,
  products_carts: ICartProduct[],
  tipo_pago: CF_PagosItems[],
  retencion: number,
  condition: number,
  ambiente: string = "00",
  tributo: TipoTributo,
  rete: number = 0,
  includeIva: boolean = false
): SVFE_CF_SEND => {
  // Generar cuerpo del documento
  const cuerpo = make_cuerpo_documento_fiscal(includeIva, products_carts);

  // totalGravada desde los items
  const totalGravada = Number(
    cuerpo.reduce((sum, item) => sum + item.ventaGravada, 0).toFixed(2)
  );

  // IVA total
  const iva = includeIva ? total_iva(products_carts) : add_iva(products_carts);

  // Subtotal sin IVA (igual a totalGravada)
  const subTotal = totalGravada;

  const MontoTotal = subTotal + iva;
  const retentionR = reteRenta(rete, MontoTotal);

  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: 3,
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: "03",
        numeroControl: generate_control(
          "03",
          codEstable,
          codPuntoVenta,
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
      receptor,
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento: cuerpo,
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: totalGravada,
        subTotalVentas: totalGravada,
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: Number(
          calcularDescuento(
            total_without_discount(products_carts),
            subTotal
          ).porcentajeDescuento.toFixed(2)
        ),
        totalDescu: Number(calDiscount(products_carts).toFixed(2)),
        tributos: [
          {
            codigo: tributo!.codigo,
            descripcion: tributo!.valores,
            valor: Number(iva.toFixed(2)),
          },
        ],
        subTotal,
        ivaRete1: Number(retencion.toFixed(2)),
        reteRenta: retentionR,
        ivaPerci1: 0,
        montoTotalOperacion: Number(MontoTotal.toFixed(2)),
        totalNoGravado: 0,
        totalPagar: Number((MontoTotal - retencion - retentionR).toFixed(2)),
        totalLetras: convertCurrencyFormat(
          (MontoTotal - retencion - retentionR).toFixed(2)
        ),
        saldoFavor: 0,
        condicionOperacion: condition,
        pagos: tipo_pago.map((tp) => ({
          codigo: tp.codigo,
          plazo: tp.plazo,
          periodo: tp.periodo,
          montoPago: tp.montoPago,
          referencia: tp.referencia,
        })),
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
};

/**
 * Calculates the retention amount for a given total based on the retention rate.
 *
 * @param {number} rete - The retention rate as a percentage.
 * @param {number} total - The total amount on which the retention is calculated.
 * @returns {number} - The calculated retention amount, or 0 if the result is negative.
 */
export const reteRenta = (rete: number, total: number) => {
  const renta = (Number(total) * Number(rete)) / 100;
  return renta > 0 ? renta : 0;
};

/**
 * Generates a Credito Fiscal Electronico object, signs it, and sends it to the
 * MH server. The function returns an object with two properties: `mh`, which
 * contains the response from the MH server, and `firmado`, which contains the
 * signed document. The `credito_fiscal` property is the generated object.
 *
 * @param {ITransmitter} transmitter - The transmitter object.
 * @param {string} codEstable - The code of the establishment.
 * @param {string} codPuntoVenta - The code of the point of sale.
 * @param {string} codEstableMH - The code of the establishment in the MH system.
 * @param {string} codPuntoVentaMH - The code of the point of sale in the MH system.
 * @param {string} tipoEstablecimiento - The type of establishment.
 * @param {number} nextCorrelative - The next correlative.
 * @param {CF_Receptor} receptor - The receptor.
 * @param {ICartProduct[]} products_carts - The products.
 * @param {FC_PagosItems[]} tipo_pago - The type of payment.
 * @param {number} retencion - The retention amount.
 * @param {number} condition - The condition.
 * @param {string} [ambiente="00"] - The environment.
 * @param {TipoTributo} tributo - The tributo.
 * @param {number} [rete=0] - The retention rate.
 * @param {boolean} [includeIva=false] - Whether to include the IVA in the
 *  calculation.
 * @param {CancelTokenSource} cancelToken - The cancel token.
 * @param {string} firmador_url - The URL of the firmador service.
 * @param {string} token - The token to use for the MH server.
 * @returns {Promise<{mh: ResponseMHSuccess; firmado: SVFE_CF_Firmado; credito_fiscal: SVFE_CF_SEND;}>}
 *  A promise that resolves with an object containing the response from the MH
 *  server and the signed document.
 */
export const process_svccfe = async (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  receptor: CF_Receptor,
  products_carts: ICartProduct[],
  tipo_pago: CF_PagosItems[],
  retencion: number,
  condition: number,
  ambiente = "00",
  tributo: TipoTributo,
  rete: number = 0,
  includeIva: boolean = false,
  cancelToken: CancelTokenSource,
  firmador_url: string,
  token: string
): Promise<{
  mh: ResponseMHSuccess;
  firmado: SVFE_CF_Firmado;
  credito_fiscal: SVFE_CF_SEND;
}> => {
  const credito_fiscal = generate_credito_fiscal(
    transmitter,
    codEstable,
    codPuntoVenta,
    codEstableMH,
    codPuntoVentaMH,
    tipoEstablecimiento,
    nextCorrelative,
    receptor,
    products_carts,
    tipo_pago,
    retencion,
    condition,
    ambiente,
    tributo,
    rete,
    includeIva
  );

  const firma = await firmar_documento(
    credito_fiscal,
    firmador_url,
    cancelToken
  );

  if (firma.data.body) {
    const payload = {
      ambiente: ambiente,
      idEnvio: 1,
      version: 3,
      tipoDte: "03",
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
          firmado: {} as SVFE_CF_Firmado,
          credito_fiscal,
        };
      } else if (response.estado === "PROCESADO") {
        return {
          mh: response,
          firmado: {
            ...credito_fiscal.dteJson,
            respuestaMH: response,
            firma: firma.data.body,
          },
          credito_fiscal,
        };
      } else {
        return {
          mh: {
            version: 0,
            ambiente,
            versionApp: 1,
            estado: "RECHAZADO",
            codigoGeneracion:
              credito_fiscal.dteJson.identificacion.codigoGeneracion,
            selloRecibido: null,
            fhProcesamiento: new Date().toLocaleDateString(),
            clasificaMsg: "0",
            codigoMsg: "0",
            descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
            observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
          },
          firmado: {} as SVFE_CF_Firmado,
          credito_fiscal,
        };
      }
    } catch {
      return {
        mh: {
          version: 0,
          ambiente,
          versionApp: 1,
          estado: "RECHAZADO",
          codigoGeneracion:
            credito_fiscal.dteJson.identificacion.codigoGeneracion,
          selloRecibido: null,
          fhProcesamiento: new Date().toLocaleDateString(),
          clasificaMsg: "0",
          codigoMsg: "0",
          descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
          observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
        },
        firmado: {} as SVFE_CF_Firmado,
        credito_fiscal,
      };
    }
  }

  return {
    mh: {
      version: 0,
      ambiente,
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion: credito_fiscal.dteJson.identificacion.codigoGeneracion,
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "FIRMA NO ENCONTRADA",
      observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
    },
    firmado: {} as SVFE_CF_Firmado,
    credito_fiscal,
  };
};
