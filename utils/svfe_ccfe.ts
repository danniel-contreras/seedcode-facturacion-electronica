import { CF_PagosItems, CF_Receptor, SVFE_CF_SEND } from "../types/svf_dte/cf.types";
import {
  ICartProduct,
  ITransmitter,
  TipoTributo,
} from "../types/svf_dte/global";
import { generate_uuid } from "./plugins/uuid";
import {
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
  tributo: TipoTributo
): SVFE_CF_SEND => {
  const subTotal = total(products_carts);
  const iva = total_iva(products_carts);
  const MontoTotal = subTotal + iva;

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
      cuerpoDocumento: make_cuerpo_documento_fiscal(products_carts),
      resumen: {
        totalNoSuj: 0,
        totalExenta: 0,
        totalGravada: Number(total(products_carts).toFixed(2)),
        subTotalVentas: Number(total(products_carts).toFixed(2)),
        descuNoSuj: 0,
        descuExenta: 0,
        descuGravada: 0,
        porcentajeDescuento: Number(
          calcularDescuento(
            total_without_discount(products_carts),
            total(products_carts)
          ).porcentajeDescuento.toFixed(2)
        ),
        totalDescu: Number(calDiscount(products_carts).toFixed(2)),
        tributos: [
          {
            codigo: tributo!.codigo,
            descripcion: tributo!.valores,
            valor: Number(total_iva(products_carts).toFixed(2)),
          },
        ],
        subTotal: Number(total(products_carts).toFixed(2)),
        ivaRete1: Number(retencion.toFixed(2)),
        reteRenta: 0,
        ivaPerci1: 0,
        montoTotalOperacion: Number(MontoTotal.toFixed(2)),
        totalNoGravado: 0,
        totalPagar: Number((MontoTotal - retencion).toFixed(2)),
        totalLetras: convertCurrencyFormat((MontoTotal - retencion).toFixed(2)),
        saldoFavor: 0,
        condicionOperacion: condition,
        pagos: tipo_pago.map((tp) => {
          return {
            codigo: tp.codigo,
            plazo: tp.plazo,
            periodo: tp.periodo,
            montoPago: tp.montoPago,
            referencia: tp.referencia,
          };
        }),
        numPagoElectronico: null,
      },
      extension: null,
      apendice: null,
    },
  };
};
