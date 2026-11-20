import { CancelTokenSourceLike } from "./cancel";
import { AxiosError } from "axios";
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
  calcularDescuento,
  calDiscount,
  convertCurrencyFormat,
  formatearNumero,
  generate_control,
  getElSalvadorDateTime,
  total,
  total_without_discount,
} from "./settings";
import {
  generate_emisor,
  generate_receptor,
  make_cuerpo_documento_factura,
} from "./utils";
import {
  address_for,
  dte_document_version,
} from "./version";

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
  ambiente = "00",
  fecEmi?: string,
  horEmi?: string,
  dteVersion?: number,
  numeroControl?: string,
  codigoGeneracion?: string
): SVFE_FC_SEND => {
  // La normativa 2.0 es la unica; `dteVersion` se acepta pero se ignora.
  void dteVersion;
  const schemaVersion = 2;

  const fechaHora =
    fecEmi && horEmi ? { fecEmi, horEmi } : getElSalvadorDateTime();

  const emisor = generate_emisor(
    transmitter,
    codEstable,
    codPuntoVenta,
    codEstableMH,
    codPuntoVentaMH,
    tipoEstablecimiento
  );

  if (schemaVersion >= 2) {
    // La normativa 2.0 ya no define estos campos en el emisor (esquema v2).
    delete (emisor as any).tipoEstablecimiento;
    delete (emisor as any).codEstableMH;
    delete (emisor as any).codPuntoVentaMH;
  }

  // La factura (01) lleva el IVA incluido en las ventas: `ventaGravada` y
  // `precioUni` ya lo contienen y `totalIva` es informativo (normativa 2.0,
  // campo 97: ivaItem = ventaGravada / 1.13 * 13%). El resumen se deriva de los
  // items para que Hacienda cuadre el total por item y la suma del resumen.
  const cuerpoDocumento = make_cuerpo_documento_factura(products);
  const sum_items = (
    key: "ventaNoSuj" | "ventaExenta" | "ventaGravada" | "noGravado" | "ivaItem"
  ) =>
    Number(
      cuerpoDocumento
        .reduce((acc, item) => acc + Number((item as any)[key] ?? 0), 0)
        .toFixed(2)
    );

  const totalNoSuj = sum_items("ventaNoSuj");
  const totalExenta = sum_items("ventaExenta");
  const totalGravada = sum_items("ventaGravada");
  const totalNoGravado = sum_items("noGravado");
  const totalIvaCalc = sum_items("ivaItem");
  const subTotalVentas = Number(
    (totalNoSuj + totalExenta + totalGravada).toFixed(2)
  );
  const totalOperacion = Number(
    (subTotalVentas + totalNoGravado).toFixed(2)
  );
  const totalPagar = Number((totalOperacion - ivaRete1).toFixed(2));

  return {
    nit: transmitter.nit,
    activo: true,
    passwordPri: transmitter.clavePrivada,
    dteJson: {
      identificacion: {
        version: dte_document_version("01", schemaVersion),
        codigoGeneracion: codigoGeneracion ?? generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: "01",
        numeroControl:
          numeroControl ??
          generate_control(
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
        ...fechaHora,
      },
      documentoRelacionado: null,
      emisor: {
        ...emisor,
        direccion: address_for(transmitter.direccion, schemaVersion),
      },
      receptor: {
        ...generate_receptor(customer),
        direccion: address_for(customer.direccion, schemaVersion),
      },
      otrosDocumentos: null,
      ventaTercero: null,
      cuerpoDocumento,
      resumen: {
        totalNoSuj,
        totalExenta,
        totalGravada,
        subTotalVentas,
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
        subTotal: subTotalVentas,
        ...(schemaVersion >= 2
          ? { ivaRete: Number(ivaRete1.toFixed(2)), observaciones: null }
          : { ivaRete1: Number(ivaRete1.toFixed(2)), reteRenta: 0 }),
        totalIva: totalIvaCalc,
        montoTotalOperacion: totalOperacion,
        totalNoGravado,
        totalPagar,
        totalLetras: convertCurrencyFormat(totalPagar.toFixed(2)),
        saldoFavor: 0,
        condicionOperacion: condition,
        pagos: tipo_pago,
        numPagoElectronico: null,
      },
      ...(schemaVersion >= 2 ? {} : { extension: null }),
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
 * @param {CancelTokenSourceLike} cancelToken - The cancel token.
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
  cancelToken: CancelTokenSourceLike,
  firmador_url: string,
  token: string,
  fecEmi?: string,
  horEmi?: string,
  numeroControl?: string,
  codigoGeneracion?: string
): Promise<{
  mh: ResponseMHSuccess;
  firmado: SVFE_FC_Firmado;
  factura: SVFE_FC_SEND;
}> => {
  const factura = generate_factura(
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
    ambiente,
    fecEmi,
    horEmi,
    undefined,
    numeroControl,
    codigoGeneracion
  );

  const firma = await firmar_documento(factura, firmador_url, cancelToken);

  if (firma.data.body) {
    const payload = {
      ambiente: ambiente,
      idEnvio: 1,
      version: factura.dteJson.identificacion.version,
      tipoDte: "01",
      documento: firma.data.body,
    };

    try {
      const response = await send_to_mh(
        payload,
        ambiente as "00" | "01",
        token,
        cancelToken,
        transmitter.nit
      );

      if (response.estado === "RECHAZADO") {
        return {
          mh: response,
          firmado: {} as SVFE_FC_Firmado,
          factura,
        };
      } else if (response.estado === "PROCESADO") {
        return {
          mh: response,
          firmado: {
            ...factura.dteJson,
            respuestaMH: response,
            firma: firma.data.body,
          },
          factura,
        };
      } else {
        return {
          mh: {
            version: 0,
            ambiente,
            versionApp: 1,
            estado: "RECHAZADO",
            codigoGeneracion: factura.dteJson.identificacion.codigoGeneracion,
            selloRecibido: null,
            fhProcesamiento: new Date().toLocaleDateString(),
            clasificaMsg: "0",
            codigoMsg: "0",
            descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
            observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
          },
          firmado: {} as SVFE_FC_Firmado,
          factura,
        };
      }
    } catch {
      return {
        mh: {
          version: 0,
          ambiente,
          versionApp: 1,
          estado: "RECHAZADO",
          codigoGeneracion: factura.dteJson.identificacion.codigoGeneracion,
          selloRecibido: null,
          fhProcesamiento: new Date().toLocaleDateString(),
          clasificaMsg: "0",
          codigoMsg: "0",
          descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
          observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
        },
        firmado: {} as SVFE_FC_Firmado,
        factura,
      };
    }
  }
  return {
    mh: {
      version: 0,
      ambiente,
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion: factura.dteJson.identificacion.codigoGeneracion,
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "FIRMA NO ENCONTRADA",
      observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
    },
    firmado: {} as SVFE_FC_Firmado,
    factura,
  };
};
