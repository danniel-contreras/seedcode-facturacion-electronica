import { FC_CuerpoDocumentoItems } from "../types/svf_dte/fc.types";
import {
  Customer,
  ICartProduct,
  ITransmitter,
  ResponseMHSuccess,
  SendMHFailed,
} from "../types/svf_dte/global";
import * as moment from "moment-timezone";

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
 * Generates an Emisor object for a FSE (Factura de Sustitución Electrónica) with
 * the given transmitter and establishment and point of sale codes.
 *
 * @param {ITransmitter} transmitter - The transmitter object.
 * @param {string} codEstable - The code of the establishment.
 * @param {string} codPuntoVenta - The code of the point of sale.
 * @param {string} codEstableMH - The code of the establishment in the MH system.
 * @param {string} codPuntoVentaMH - The code of the point of sale in the MH system.
 * @returns {Object} - The Emisor object.
 */
export const generate_emisor_fse = (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string
) => {
  return {
    nit: transmitter.nit,
    nrc: transmitter.nrc,
    nombre: transmitter.nombre,
    codActividad: transmitter.codActividad,
    descActividad: transmitter.descActividad,
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
 *
 * La factura (01) declara el IVA dentro del precio y Hacienda valida que la
 * clase de venta del item sea igual a `cantidad * precioUni - montoDescu`
 * (codigo 003 "El valor es diferente a la operacion"). Por eso un item no
 * puede mezclar venta gravada con no sujeta/exenta: si un producto declara
 * varias clases, cada una se emite como una linea propia. El resumen se suma
 * desde estas lineas.
 * @param {ICartProduct[]} products_cart - The products in the cart.
 * @returns {FC_CuerpoDocumentoItems[]} - An array of FC_CuerpoDocumentoItems.
 */
export const make_cuerpo_documento_factura = (
  products_cart: ICartProduct[]
): FC_CuerpoDocumentoItems[] => {
  const items: FC_CuerpoDocumentoItems[] = [];

  for (const cp of products_cart) {
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

    const quantity = Number(cp.quantity) || 0;
    // El descuento es de la linea: se aplica una sola vez (primera clase).
    const lineDiscount = Number(
      (Number(cp.monto_descuento ?? 0) * quantity).toFixed(2)
    );
    const ventaNoSuj = Number(Number(cp.total_no_suj ?? 0).toFixed(2));
    const ventaExenta = Number(Number(cp.total_exenta ?? 0).toFixed(2));
    // La venta gravada de la factura incluye IVA: precio (con IVA) por cantidad.
    const ventaGravada =
      Number(cp.total_gravada) > 0
        ? Number((price * quantity).toFixed(2))
        : 0;

    const clases = [
      { ventaNoSuj, ventaExenta: 0, ventaGravada: 0 },
      { ventaNoSuj: 0, ventaExenta, ventaGravada: 0 },
      { ventaNoSuj: 0, ventaExenta: 0, ventaGravada },
    ].filter(
      (clase) => clase.ventaNoSuj + clase.ventaExenta + clase.ventaGravada > 0
    );

    if (clases.length === 0) {
      clases.push({ ventaNoSuj: 0, ventaExenta: 0, ventaGravada: 0 });
    }

    clases.forEach((clase, claseIndex) => {
      const venta = Number(
        (clase.ventaNoSuj + clase.ventaExenta + clase.ventaGravada).toFixed(2)
      );
      const montoDescu = claseIndex === 0 ? lineDiscount : 0;

      items.push({
        numItem: items.length + 1,
        tipoItem: Number(cp.tipoItem),
        uniMedida: Number(cp.uniMedida),
        numeroDocumento: null,
        cantidad: cp.quantity,
        codigo: cp.productCode,
        codTributo: null,
        descripcion: cp.productName,
        precioUni:
          quantity > 0
            ? Number(((venta + montoDescu) / quantity).toFixed(4))
            : venta,
        montoDescu,
        ventaNoSuj: clase.ventaNoSuj,
        ventaExenta: clase.ventaExenta,
        ventaGravada: clase.ventaGravada,
        ivaItem: Number(
          (clase.ventaGravada - clase.ventaGravada / 1.13).toFixed(2)
        ),
        tributos: null,
        psv: 0,
        noGravado: claseIndex === 0 ? Number(cp.no_gravado) : 0,
      });
    });
  }

  return items;
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
export const make_cuerpo_documento_fiscal = (
  includeIVA = true,
  saleType: "Gravada" | "Exenta" | "NoSujeta",
  $discountPercentage: number,
  products_cart: ICartProduct[]
) => {
  return products_cart.map((cp, index) => {
    const prices = [
      Number(cp.base_price),
      Number(cp.priceA),
      Number(cp.priceB),
      Number(cp.priceC),
    ];

    const rawPrice = Number(cp.price);
    const price = prices.includes(rawPrice)
      ? rawPrice
      : rawPrice === Number(prices[0])
        ? Number(prices[1])
        : rawPrice;

    const quantity = Number(cp.quantity);
    const totalWithTax = price * quantity;
    const unitPriceWithoutTax =
      includeIVA && saleType === "Gravada" ? +(price / 1.13).toFixed(4) : price;
    const totalWithoutTax = +(unitPriceWithoutTax * quantity).toFixed(4);

    const discountBase =
      saleType === "Gravada" ? totalWithoutTax : totalWithTax;
    const discountAmount = +(
      (discountBase * $discountPercentage) /
      100
    ).toFixed(2);

    const netGravada = +(totalWithoutTax - discountAmount).toFixed(4);
    const netNoSujOrEx = +(totalWithTax - discountAmount).toFixed(4);

    const ventaGravada = saleType === "Gravada" ? netGravada : 0;
    const ventaExenta = saleType === "Exenta" ? netNoSujOrEx : 0;
    const ventaNoSuj = saleType === "NoSujeta" ? netNoSujOrEx : 0;

    const tributos = saleType === "Gravada" ? ["20"] : null;

    return {
      numItem: index + 1,
      tipoItem: Number(cp.tipoItem),
      uniMedida: Number(cp.uniMedida),
      numeroDocumento: null,
      cantidad: quantity,
      codigo: cp.productCode !== "N/A" ? cp.productCode : null,
      codTributo: null,
      descripcion: cp.productName,
      precioUni:
        includeIVA && saleType === "Gravada"
          ? +unitPriceWithoutTax.toFixed(4)
          : +price.toFixed(4),
      montoDescu: discountAmount,
      ventaNoSuj,
      ventaExenta,
      ventaGravada,
      tributos,
      psv:
        0,
      noGravado: cp.no_gravado,
    };
  });
};

const quitIva = (price: number | string) => (Number(price) / 1.13).toFixed(2);

/**
 * Quita guiones y espacios de un numero de documento. Hacienda espera el NIT
 * y el DUI solo con digitos, tanto en el esquema v1.2 como en el 2.0.
 * @param {string | null} value - Numero de documento tal como viene del cliente.
 * @returns {string | null} El documento sin guiones ni espacios.
 */
export const clean_num_documento = <T extends string | null | undefined>(
  value: T
): T => {
  if (value === null || value === undefined || value === "") return value;
  return String(value).replace(/[\s-]/g, "") as T;
};

/**
 * Generates the SVFE_FC_Receptor object from a Customer object.
 * - If the Customer.nrc is not zero, sets the tipoDocumento to "36" and numDocumento to Customer.nit.
 * - If the Customer.nrc is zero, sets the tipoDocumento to Customer.tipoDocumento and numDocumento to Customer.numDocumento without dashes.
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
        ? clean_num_documento(value!.nit)
        : value!.numDocumento === "0" || value.numDocumento === "N/A"
          ? null
          : clean_num_documento(value!.numDocumento),
    nrc: convertToNull(value!.nrc),
    nombre: value!.nombre,
    codActividad: convertToNull(value!.codActividad),
    descActividad: convertToNull(value!.descActividad),
    direccion: {
      departamento: value!.direccion?.departamento,
      municipio: value!.direccion?.municipio,
      distrito: (value!.direccion as any)?.distrito,
      nombreDistrito: (value!.direccion as any)?.nombreDistrito,
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
    if (value !== "" && value !== "0" && value !== "N/A") return value;
    else return null;
  }
  return null;
};

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
/**
 * Verifica si se puede aplicar una anulación a un DTE emitido en una fecha
 * dada, dependiendo del tipo de DTE y la fecha actual.
 *
 * @param {string} tipoDte - Tipo de DTE.
 * @param {string} date - Fecha del DTE en formato "YYYY-MM-DD".
 * @returns {boolean} True si se puede aplicar la anulación, false en caso
 *   contrario.
 * @throws {Error} Si el formato de la fecha es inválido o el tipo de DTE no
 *   es válido.
 */
export function verifyApplyAnulation(tipoDte: string, date: string): boolean {
  const fechaDTEParseada = moment(date, "YYYY-MM-DD");
  if (!fechaDTEParseada.isValid())
    throw new Error("Formato de fecha DTE inválido");

  const daysDiference = moment().diff(fechaDTEParseada, "days");
  const limits = { "01": 90, "03": 1 };

  if (limits[tipoDte] !== undefined && daysDiference <= limits[tipoDte])
    return true;
  throw new Error(
    "DTE fuera del plazo de disponibilidad o tipo de DTE inválido"
  );
}
