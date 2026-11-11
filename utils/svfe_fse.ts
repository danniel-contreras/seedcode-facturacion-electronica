import { CancelTokenSourceLike } from "./cancel";
import { FSE_Invalidacion_Documento, FSE_Invalidacion_Motivo, SVFE_FSE_Firmado, SVFE_FSE_SEND } from "../types/svf_dte/fse.types";
import {
  Customer,
  ICartProduct,
  ICartProductFSE,
  ITransmitter,
  ResponseMHSuccess,
} from "../types/svf_dte/global";
import { generate_uuid } from "./plugins/uuid";
import {
  convertCurrencyFormat,
  formatearNumero,
  generate_control,
  getElSalvadorDateTime,
} from "./settings";
import {
  clean_num_documento,
  convertToNull,
  generate_emisor,
  generate_emisor_fse,
} from "./utils";
import { firmar_documento, send_to_mh } from "./services/svfe.service";
import {
  address_for,
  dte_document_version,
  get_dte_normative,
} from "./version";

/**
 * Description
 *
 * @function
 * @name generate_excluded_subject
 * @kind variable
 * @param {ITransmitter} transmitter
 * @param {string} codEstable
 * @param {string} codPuntoVenta
 * @param {string} codEstableMH
 * @param {string} codPuntoVentaMH
 * @param {string} tipoEstablecimiento
 * @param {number} nextCorrelative
 * @param {Customer} sujetoExcluido
 * @param {"00" | "01"} ambiente
 * @param {ICartProductFSE[]} products
 * @param {string} observaciones
 * @returns {SVFE_FSE_SEND}
 * @exports
 */
export const generate_excluded_subject = (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  sujetoExcluido: Customer,
  ambiente: "00" | "01",
  products: ICartProductFSE[],
  observaciones: string,
  dteVersion?: number
): SVFE_FSE_SEND => {
  const schemaVersion = dteVersion ?? get_dte_normative();
  const subTotal = products.reduce((total, product) => {
    return total + product.precioUni * product.cantidad;
  }, 0);

  const filteredProducts = products.filter(
    (product) => product.tipoItem === 2 || product.tipoItem === 3
  );

  const reteRenta = filteredProducts.reduce((total, product) => {
    return total + product.precioUni * product.cantidad * 0.1;
  }, 0);

  const total = subTotal - reteRenta;

  const emisor_fse = generate_emisor_fse(
    transmitter,
    codEstable,
    codPuntoVenta,
    codEstableMH,
    codPuntoVentaMH
  );

  if (schemaVersion >= 2) {
    // La normativa 2.0 ya no define los códigos MH en el emisor del FSE.
    delete (emisor_fse as any).codEstableMH;
    delete (emisor_fse as any).codPuntoVentaMH;
  }

  return {
    nit: transmitter.nit,
    passwordPri: transmitter.clavePrivada,
    activo: true,
    dteJson: {
      identificacion: {
        version: dte_document_version("14", schemaVersion),
        codigoGeneracion: generate_uuid().toUpperCase(),
        ambiente: ambiente,
        tipoDte: "14",
        numeroControl: generate_control(
          "14",
          codEstable!,
          codPuntoVenta!,
          formatearNumero(Number(nextCorrelative))
        ),
        tipoModelo: 1,
        tipoOperacion: 1,
        tipoContingencia: null,
        motivoContin: null,
        tipoMoneda: "USD",
        ...getElSalvadorDateTime(),
      },
      emisor: {
        ...emisor_fse,
        direccion: address_for(transmitter.direccion, schemaVersion),
      },
      // La normativa 2.0 renombró `sujetoExcluido` a `receptor`.
      ...(schemaVersion >= 2
        ? {
            receptor: {
              ...generate_subject(sujetoExcluido),
              direccion: address_for(sujetoExcluido.direccion, schemaVersion),
            },
          }
        : { sujetoExcluido: generate_subject(sujetoExcluido) }),
      cuerpoDocumento: products.map((prd, index) => ({
        ...prd,
        numItem: index + 1,
        codigo: convertToNull(prd.codigo),
      })),
      resumen: {
        totalCompra: Number(subTotal.toFixed(2)),
        descu: 0,
        totalDescu: 0,
        subTotal: Number(subTotal.toFixed(2)),
        // La normativa 2.0 eliminó `ivaRete1` del resumen del FSE.
        ...(schemaVersion >= 2 ? {} : { ivaRete1: 0 }),
        reteRenta: Number(reteRenta.toFixed(2)),
        totalPagar: Number(total.toFixed(2)),
        totalLetras: convertCurrencyFormat(total.toFixed(2)),
        condicionOperacion: 1,
        pagos: [
          {
            codigo: "01",
            montoPago: Number(total.toFixed(2)),
            referencia: "",
            plazo: null,
            periodo: null,
          },
        ],
        observaciones,
      },
      apendice: null,
    },
  };
};

/**
 * Description
 *
 * @function
 * @name generate_subject
 * @kind variable
 * @param {Customer} customer
 * @returns {{ tipoDocumento: string; numDocumento: string; nombre: string; codActividad: string; descActividad: string; direccion: { departamento: string; municipio: string; complemento: string; }; telefono: string; correo: string; }}
 * @exports
 */
export const generate_subject = (customer: Customer) => {
  return {
    tipoDocumento: customer!.tipoDocumento,
    numDocumento: clean_num_documento(customer!.numDocumento),
    nombre: customer!.nombre,
    codActividad: convertToNull(customer?.codActividad),
    descActividad: convertToNull(customer?.descActividad),
    direccion: {
      departamento: customer!.direccion.departamento,
      municipio: customer!.direccion.municipio,
      complemento: customer!.direccion.complemento,
    },
    telefono: convertToNull(customer?.telefono),
    correo: convertToNull(customer?.correo),
  };
};

/**
 * Description
 * 
 * @async
 * @function
 * @name process_svfse
 * @kind variable
 * @param {ITransmitter} transmitter
 * @param {string} codEstable
 * @param {string} codPuntoVenta
 * @param {string} codEstableMH
 * @param {string} codPuntoVentaMH
 * @param {string} tipoEstablecimiento
 * @param {number} nextCorrelative
 * @param {Customer} sujetoExcluido
 * @param {"00" | "01"} ambiente
 * @param {ICartProductFSE[]} products
 * @param {string} observaciones
 * @param {CancelTokenSourceLike} cancelToken
 * @param {string} firmador_url
 * @param {string} token
 * @returns {Promise<{ mh: ResponseMHSuccess; firmado: SVFE_FSE_Firmado; sujeto_excluido: SVFE_FSE_SEND; }>}
 * @exports
 */
export const process_svfse = async (
  transmitter: ITransmitter,
  codEstable: string,
  codPuntoVenta: string,
  codEstableMH: string,
  codPuntoVentaMH: string,
  tipoEstablecimiento: string,
  nextCorrelative: number,
  sujetoExcluido: Customer,
  ambiente: "00" | "01",
  products: ICartProductFSE[],
  observaciones: string,
  cancelToken: CancelTokenSourceLike,
  firmador_url: string,
  token: string
): Promise<{
  mh: ResponseMHSuccess;
  firmado: SVFE_FSE_Firmado;
  sujeto_excluido: SVFE_FSE_SEND;
}> => {
  const sujeto_excluido_gen = generate_excluded_subject(
    transmitter,
    codEstable,
    codPuntoVenta,
    codEstableMH,
    codPuntoVentaMH,
    tipoEstablecimiento,
    nextCorrelative,
    sujetoExcluido,
    ambiente,
    products,
    observaciones
  );

  const firma = await firmar_documento(
    sujeto_excluido_gen,
    firmador_url,
    cancelToken
  );

  if (firma.data.body) {
    const payload = {
      ambiente: ambiente,
      idEnvio: 1,
      version: sujeto_excluido_gen.dteJson.identificacion.version,
      tipoDte: "14",
      documento: firma.data.body,
    };

    try {
      const response = await send_to_mh(
        payload,
        ambiente as "00" | "01",
        token,
        cancelToken,
        transmitter.nit,
      );

      if (response.estado === "RECHAZADO") {
        return {
          mh: response,
          firmado: {} as SVFE_FSE_Firmado,
          sujeto_excluido: sujeto_excluido_gen,
        };
      } else if (response.estado === "PROCESADO") {
        return {
          mh: response,
          firmado: {
            ...sujeto_excluido_gen.dteJson,
            respuestaMH: response,
            firma: firma.data.body,
          },
          sujeto_excluido: sujeto_excluido_gen,
        };
      } else {
        return {
          mh: {
            version: 0,
            ambiente,
            versionApp: 1,
            estado: "RECHAZADO",
            codigoGeneracion:
              sujeto_excluido_gen.dteJson.identificacion.codigoGeneracion,
            selloRecibido: null,
            fhProcesamiento: new Date().toLocaleDateString(),
            clasificaMsg: "0",
            codigoMsg: "0",
            descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
            observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
          },
          firmado: {} as SVFE_FSE_Firmado,
          sujeto_excluido: sujeto_excluido_gen,
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
            sujeto_excluido_gen.dteJson.identificacion.codigoGeneracion,
          selloRecibido: null,
          fhProcesamiento: new Date().toLocaleDateString(),
          clasificaMsg: "0",
          codigoMsg: "0",
          descripcionMsg: "ERROR EN ENVIÓ AL SERVIDOR",
          observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
        },
        firmado: {} as SVFE_FSE_Firmado,
        sujeto_excluido: sujeto_excluido_gen,
      };
    }
  }

  return {
    mh: {
      version: 0,
      ambiente,
      versionApp: 1,
      estado: "RECHAZADO",
      codigoGeneracion:
        sujeto_excluido_gen.dteJson.identificacion.codigoGeneracion,
      selloRecibido: null,
      fhProcesamiento: new Date().toLocaleDateString(),
      clasificaMsg: "0",
      codigoMsg: "0",
      descripcionMsg: "FIRMA NO ENCONTRADA",
      observaciones: ["NO SE OBTUVO RESPUESTA DEL SERVIDOR"],
    },
    firmado: {} as SVFE_FSE_Firmado,
    sujeto_excluido: sujeto_excluido_gen,
  };
};

export const generate_invalidation_fse = (transmitter: ITransmitter, documento: FSE_Invalidacion_Documento, motivo: FSE_Invalidacion_Motivo, tipoEstablecimiento: string, nomEstablecimiento: string, codEstable: string, codPuntoVenta: string, ambiente: "00" | "01") => {
  return {
    identificacion: {
      version: 2,
      ambiente: ambiente,
      codigoGeneracion: generate_uuid().toUpperCase(),
      fecAnula: getElSalvadorDateTime().fecEmi,
      horAnula: getElSalvadorDateTime().horEmi

    },
    emisor: {
      nit: transmitter.nit,
      nombre: transmitter.nombre,
      tipoEstablecimiento: tipoEstablecimiento,
      telefono: transmitter.telefono,
      correo: transmitter.correo,
      codEstable, 
      codPuntoVenta,
      nomEstablecimiento
    },
    documento,
    motivo
  }
}

export const proccess_invalidation_fse = () => {

}