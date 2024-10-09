import { ICartProduct } from "../types/svf_dte/global";

export function convertCurrencyFormat(input: string) {
  const [amount, cents = "00"] = input.includes(".")
    ? input.split(".")
    : [input];

  /**
   * Converts a given number to its representation in words
   * @param {number} num - The number to be converted
   * @example numberToWords(12) "DOCE"
   * @example numberToWords(123) "CIENTO VEINTITRES"
   * @example numberToWords(1234) "MIL DOCIENTOS TREINTA Y CUATRO"
   */
  const numberToWords = (num: number): string => {
    const units = [
      "",
      "UNO",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
      "DIEZ",
      "ONCE",
      "DOCE",
      "TRECE",
      "CATORCE",
      "QUINCE",
      "DIECISEIS",
      "DIECISIETE",
      "DIECIOCHO",
      "DIECINUEVE",
    ];
    const tens = [
      "",
      "",
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const hundreds = [
      "",
      "CIEN",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];

    if (num < 20) return units[num];
    if (num < 100) {
      const unit = num % 10;
      const ten = Math.floor(num / 10);
      return unit === 0 ? tens[ten] : `${tens[ten]} Y ${units[unit]}`;
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      const remainderInWords =
        remainder > 0 ? ` ${numberToWords(remainder)}` : "";
      return hundreds[hundred] + remainderInWords;
    }
    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      const thousandsInWords =
        thousands > 1 ? numberToWords(thousands) + " MIL" : "MIL";
      const remainderInWords =
        remainder > 0 ? ` ${numberToWords(remainder)}` : "";
      return thousandsInWords + remainderInWords;
    }
    return "";
  };

  const amountInWords = numberToWords(parseInt(amount));
  const centsFormatted = cents.padEnd(2, "0");

  return `${amountInWords} ${centsFormatted}/100 DOLARES AMERICANOS`;
}

/**
 * Calculates the total with iva and the iva amount given a total without iva
 * @param {number} total - The total without iva
 * @returns {{iva: number, total_with_iva: number}} - An object with the iva amount and the total with iva
 */
export const calc_iva = (total: number): { iva: number; total_with_iva: number; } => {
  const iva = total * 0.13;
  const total_with_iva = total + iva;
  return {
    iva,
    total_with_iva,
  };
};

/**
 * Calculates the discount amount and percentage given the original price and desired price.
 * @param {number} precioOriginal - The original price of the item.
 * @param {number} precioDeseado - The desired price of the item.
 * @returns {{montoDescuento: number, porcentajeDescuento: number}} - An object containing the discount amount and the discount percentage.
 */
export function calcularDescuento(
  precioOriginal: number,
  precioDeseado: number
): { montoDescuento: number; porcentajeDescuento: number; } {
  const montoDescuento = precioOriginal - precioDeseado;
  const porcentajeDescuento = (montoDescuento / precioOriginal) * 100;
  return { montoDescuento, porcentajeDescuento };
}
/**
 * Calculates the desired price and discount amount given the original price and discount percentage.
 * @param {number} precioOriginal - The original price of the item.
 * @param {number} porcentajeDescuento - The discount percentage to apply to the original price.
 * @returns {{montoDescuento: number, precioDeseado: number}} - An object containing the desired price and discount amount.
 */
export function calcularPrecioDeseado(
  precioOriginal: number,
  porcentajeDescuento: number
): { montoDescuento: number; precioDeseado: number; } {
  const montoDescuento = (porcentajeDescuento / 100) * precioOriginal;
  const precioDeseado = precioOriginal - montoDescuento;
  return { montoDescuento, precioDeseado };
}

/**
 * Generates the control number for a DTE document.
 * @param {string} tipo_sol - The type of solicitation for the document.
 * @param {string} codStable - The code of the establishment.
 * @param {string} codPVenta - The code of the point of sale.
 * @param {string} nTicket - The number of the ticket.
 * @returns {string} - The control number of the document.
 */
export const generate_control = (
  tipo_sol: string,
  codStable: string,
  codPVenta: string,
  nTicket: string
): string => {
  return `DTE-${tipo_sol}-${codStable + codPVenta}-${nTicket}`;
};

/**
 * Formatea un numero para que tenga 15 digitos,
 * llenando con ceros a la izquierda si es necesario.
 * @param {number} numero - El numero a formatear.
 * @returns {string} - El numero formateado.
 * @example formatearNumero(123) // '0000000000000123'
 */
export function formatearNumero(numero: number): string {
  const numeroFormateado: string = numero.toString().padStart(15, "0");
  return numeroFormateado;
}

/**
 * Returns the current date and time in El Salvador's timezone, formatted according to the
 * DTE (Documento Tributario Electronico) standard.
 * @returns {{fecEmi: string, horEmi: string}} - An object containing the current date and
 *   time, with the date in the format "YYYY-MM-DD" and the time in the format "HH:MM:SS".
 */
export function getElSalvadorDateTime(): { fecEmi: string; horEmi: string } {
  const elSalvadorTimezone = "America/El_Salvador";
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: elSalvadorTimezone,
  };

  const dateObj = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", dateOptions).format(
    dateObj
  );

  const [datePart, timePart] = formattedDate.split(", ");

  const [month, day, year] = datePart.split("/");

  const formattedDatePart = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  return { fecEmi: formattedDatePart, horEmi: timePart };
}

/**
 * Calculates the iva amount for a given price and quantity.
 * @param {number} price - The price of the item.
 * @param {number} quantity - The quantity of the item.
 * @returns {number} - The iva amount.
 */
export const get_iva = (price: number, quantity: number): number => {
  const total = Number(price) * Number(quantity);

  const iva = total / 1.13;

  return total - iva;
};

/**
 * Adds a dash to the end of a string, unless it already contains a dash.
 * @param {string} texto - The string to add a dash to.
 * @returns {string} - The string with a dash added to the end, if it didn't already contain one.
 */
export function agregarGuion(texto: string): string {
  if (!texto.includes("-")) {
    return texto.slice(0, -1) + "-" + texto.slice(-1);
  }
  return texto;
}

/**
 * Calculates the total amount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total amount of the cart.
 */
export const total = (productsCarts: ICartProduct[]): number => {
  const total = productsCarts
    .map((cp) => Number(cp.quantity) * Number(cp.price))
    .reduce((a, b) => a + b, 0);

  return total;
};

/**
 * Calculates the total amount of a cart without considering discounts.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total amount of the cart without considering discounts.
 */
export const total_without_discount = (productsCarts: ICartProduct[]): number => {
  const total = productsCarts
    .map((prd) => {
      const price =
        Number(prd.price) < prd.base_price ? prd.base_price : Number(prd.price);
      return price * prd.quantity;
    })
    .reduce((a, b) => a + b, 0);

  return total;
};

/**
 * Calculates the total discount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total discount of the cart.
 */
export const calDiscount = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((prd) => Number(prd.monto_descuento * prd.quantity))
    .reduce((a, b) => a + b, 0);
};

/**
 * Calculates the total iva amount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total iva amount of the cart.
 */
export const total_iva = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((cp) => {
      const total = Number(cp.price) * Number(cp.quantity);

      const iva = total / 1.13;

      return total - iva;
    })
    .reduce((a, b) => a + b, 0);
};

/**
 * Calculates the total gravada amount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total gravada amount of the cart.
 */
export const calc_gravada = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((total) => Number(total.total_gravada))
    .reduce((a, b) => a + b, 0);
};


/**
 * Calculates the total exenta amount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total exenta amount of the cart.
 */
export const calc_exenta = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((total) => Number(total.total_exenta))
    .reduce((a, b) => a + b, 0);
};


/**
 * Calculates the total no sujeta amount of a cart.
 * @param {ICartProduct[]} productsCarts - The products in the cart.
 * @returns {number} - The total no sujeta amount of the cart.
 */

export const calc_no_suj = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((total) => Number(total.total_no_suj))
    .reduce((a, b) => a + b, 0);
};

export const calc_no_grav = (productsCarts: ICartProduct[]): number => {
  return productsCarts
    .map((total) => Number(total.no_gravado))
    .reduce((a, b) => a + b, 0);
};