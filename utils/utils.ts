import { FC_CuerpoDocumentoItems } from "../types/svf_dte/fc.types";
import { Customer, ICartProduct, ITransmitter } from "../types/svf_dte/global";
import { agregarGuion, get_iva } from "./settings";

/**
 * Generates an Emisor object based on the given transmitter and establishment
 * and point of sale codes.
 *
 * @param {ITransmitter} transmitter - The transmitter object.
 * @param {string} codEstable - The code of the establishment.
 * @param {string} codPuntoVenta - The code of the point of sale.
 * @param {string} codEstableMH - The code of the establishment in the MH system.
 * @param {string} codPuntoVentaMH - The code of the point of sale in the MH system.
 * @param {string} tipoEstablecimiento - The type of establishment.
 * @returns {Object} - The Emisor object.
 */
export const generate_emisor = (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string
) => {
  return {
    nit: transmitter.nit,
    nrc: transmitter.nrc,
    nombre: transmitter.nombre,
    nombreComercial: transmitter.nombreComercial,
    codActividad: transmitter.codActividad,
    descActividad: transmitter.descActividad,
    tipoEstablecimiento: tipoEstablecimiento,
    direccion: {
      departamento: transmitter.direccion.departamento,
      municipio: transmitter.direccion.municipio,
      complemento: transmitter.direccion.complemento,
    },
    telefono: transmitter.telefono,
    correo: transmitter.correo,
    codEstable: codEstable,
    codEstableMH: codEstableMH === "0" ? null : codEstableMH,
    codPuntoVenta: codPuntoVenta,
    codPuntoVentaMH: codPuntoVentaMH === "0" ? null : codPuntoVentaMH,
  };
};

/**
 * Makes an array of FC_CuerpoDocumentoItems from an array of ICartProduct.
 * The prices are selected based on the value of the "price" field of the product.
 * If the price is one of the base prices, the price is selected.
 * If not, the first non-zero price is selected.
 * @param {ICartProduct[]} products_cart - The products in the cart.
 * @returns {FC_CuerpoDocumentoItems[]} - An array of FC_CuerpoDocumentoItems.
 */
export const make_cuerpo_documento_factura = (
  products_cart: ICartProduct[]
): FC_CuerpoDocumentoItems[] => {
  return products_cart.map((cp, index) => {
    const prices = [
      Number(cp.base_price),
      Number(cp.priceA),
      Number(cp.priceB),
      Number(cp.priceC),
    ];

    const price = prices.includes(Number(cp.price))
      ? Number(cp.price)
      : Number(cp.price) === Number(prices[0])
      ? Number(prices[1])
      : Number(cp.price);

    return {
      numItem: index + 1,
      tipoItem: Number(cp.tipoItem),
      uniMedida: Number(26),
      numeroDocumento: null,
      cantidad: cp.quantity,
      codigo: cp.productCode,
      codTributo: null,
      descripcion: cp.productName,
      precioUni: Number(price.toFixed(2)),
      montoDescu: Number((cp.monto_descuento * cp.quantity).toFixed(2)),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: Number((cp.quantity * Number(cp.price)).toFixed(2)),
      ivaItem: Number(get_iva(Number(cp.price), cp.quantity).toFixed(2)),
      tributos: null,
      psv: 0,
      noGravado: 0,
    };
  });
};

export const generate_receptor = (value: Customer) => {
    return {
      tipoDocumento:
        Number(value!.nrc) !== 0 && value!.nrc
          ? '36'
          : value!.tipoDocumento === '0' || value.tipoDocumento === 'N/A'
            ? null
            : value!.tipoDocumento,
      numDocumento:
        Number(value!.nrc) !== 0 && value!.nrc
          ? value!.nit
          : value!.numDocumento === '0' || value.numDocumento === 'N/A'
            ? null
            : agregarGuion(value!.numDocumento),
      nrc: Number(value!.nrc) === 0 ? null : value!.nrc,
      nombre: value!.nombre,
      codActividad: Number(value!.codActividad) === 0 ? null : value!.codActividad,
      descActividad: Number(value!.descActividad) === 0 ? null : value!.descActividad,
      direccion: {
        departamento: value!.direccion?.departamento,
        municipio: value!.direccion?.municipio,
        complemento: value!.direccion?.complemento,
      },
      telefono: value!.telefono,
      correo: value!.correo,
    };
  };