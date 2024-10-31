import { FC_CuerpoDocumentoItems } from "../types/svf_dte/fc.types";
import {
  Customer,
  ICartProduct,
  ITransmitter,
  ResponseMHSuccess,
  SendMHFailed,
} from "../types/svf_dte/global";
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
    codEstableMH: convertToNull(codEstableMH),
    codPuntoVenta: codPuntoVenta,
    codPuntoVentaMH: convertToNull(codPuntoVentaMH),
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
      uniMedida: Number(cp.uniMedida),
      numeroDocumento: null,
      cantidad: cp.quantity,
      codigo: cp.productCode,
      codTributo: null,
      descripcion: cp.productName,
      precioUni: Number(price.toFixed(2)),
      montoDescu: cp.monto_descuento,
      ventaNoSuj: cp.total_no_suj,
      ventaExenta: cp.total_exenta,
      ventaGravada: cp.total_gravada,
      ivaItem: Number(get_iva(Number(cp.total_gravada), 1).toFixed(2)),
      tributos: null,
      psv: 0,
      noGravado: Number(cp.no_gravado),
    };
  });
};

/**
 * Makes an array of FC_CuerpoDocumentoItems from an array of ICartProduct.
 * The prices are selected based on the value of the "price" field of the product.
 * If the price is one of the base prices, the price is selected.
 * If not, the first non-zero price is selected.
 * @param {boolean} includeIva - Whether to include IVA in the total.
 * @param {ICartProduct[]} products_cart - The products in the cart.
 * @returns {FC_CuerpoDocumentoItems[]} - An array of FC_CuerpoDocumentoItems.
 */
/**
 * Makes an array of FC_CuerpoDocumentoItems from an array of ICartProduct.
 * The prices are selected based on the value of the "price" field of the product.
 * If the price is one of the base prices, the price is selected.
 * If not, the first non-zero price is selected.
 */
export const make_cuerpo_documento_fiscal = (includeIva: boolean, products_cart: ICartProduct[]) => {
  return products_cart.map((cp, index) => {
    const prices = [
      Number(cp.base_price),
      Number(cp.priceA),
      Number(cp.priceB),
      Number(cp.priceC),
    ];

    let price = prices.includes(Number(cp.price))
      ? Number(cp.price)
      : Number(cp.price) === Number(prices[0])
        ? Number(prices[1])
        : Number(cp.price);

    includeIva ? price = Number(quitIva(price)) : price = price;
    return {
      numItem: index + 1,
      tipoItem: Number(cp.tipoItem),
      uniMedida: Number(cp.uniMedida),
      numeroDocumento: null,
      cantidad: cp.quantity,
      codigo: convertToNull(cp.productCode),
      codTributo: null,
      descripcion: cp.productName,
      precioUni: Number(price.toFixed(2)),
      montoDescu: Number((cp.monto_descuento * cp.quantity).toFixed(2)),
      ventaNoSuj: 0,
      ventaExenta: 0,
      ventaGravada: Number((price! * cp.quantity).toFixed(2)),
      tributos: ["20"],
      psv: 0,
      noGravado: cp.no_gravado,
    };
  });
};

const quitIva = (price: number | string) => (Number(price) / 1.13).toFixed(2);

/**
 * Generates the SVFE_FC_Receptor object from a Customer object.
 * - If the Customer.nrc is not zero, sets the tipoDocumento to "36" and numDocumento to Customer.nit.
 * - If the Customer.nrc is zero, sets the tipoDocumento to Customer.tipoDocumento and numDocumento to Customer.numDocumento after adding a dash.
 * - Sets the nrc to Customer.nrc if it is not zero.
 * - Sets the nombre to Customer.nombre.
 * - Sets the codActividad to Customer.codActividad if it is not zero.
 * - Sets the descActividad to Customer.descActividad if it is not zero.
 * - Sets the direccion object with the departamento, municipio and complemento from the Customer.direccion object.
 * - Sets the telefono to Customer.telefono.
 * - Sets the correo to Customer.correo.
 * @param {Customer} value - The Customer object to generate the SVFE_FC_Receptor from.
 * @returns {SVFE_FC_Receptor} The generated SVFE_FC_Receptor object.
 */
export const generate_receptor = (value: Customer) => {
  return {
    tipoDocumento:
      Number(value!.nrc) !== 0 && value!.nrc
        ? "36"
        : value!.tipoDocumento === "0" || value.tipoDocumento === "N/A"
          ? null
          : value!.tipoDocumento,
    numDocumento:
      Number(value!.nrc) !== 0 && value!.nrc
        ? value!.nit
        : value!.numDocumento === "0" || value.numDocumento === "N/A"
          ? null
          : agregarGuion(value!.numDocumento),
    nrc: convertToNull(value!.nrc),
    nombre: value!.nombre,
    codActividad: convertToNull(value!.codActividad),
    descActividad: convertToNull(value!.descActividad),
    direccion: {
      departamento: value!.direccion?.departamento,
      municipio: value!.direccion?.municipio,
      complemento: value!.direccion?.complemento,
    },
    telefono: convertToNull(value!.telefono),
    correo: value!.correo,
  };
};

/**
 * Returns the value if it is not empty, zero or "N/A", otherwise returns null.
 * @param {string | null} value - The value to check.
 * @returns {string | null} The value if it is not empty, zero or "N/A", otherwise null.
 */
export const convertToNull = (value: string | null) => {
  if (value) {
    if (value !== "" && value !== "0" && value !== "N/A") return value
    else return null
  }
  return null
}


export function isResponseMHSuccess(
  response: any
): response is ResponseMHSuccess {
  return response && response.success === true;
}

// Definir un type guard para verificar si es SendMHFailed
export function isSendMHFailed(response: any): response is SendMHFailed {
  return response && response.success === false;
}

// Verifica si la respuesta es un éxito
export function isResponseMH(res: any): res is ResponseMHSuccess {
  return res && res.success === true && "estado" in res;
}
