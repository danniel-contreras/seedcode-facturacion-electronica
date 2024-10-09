import { FC_PagosItems, SVFE_FC_SEND } from "../types/svf_dte/fc.types";
import { Customer, ICartProduct, ITransmitter } from "../types/svf_dte/global";
import { generate_uuid } from "./plugins/uuid";
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
