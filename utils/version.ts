/**
 * Soporte de la normativa de cumplimiento de DTE versión 2.0 del Ministerio de
 * Hacienda (obligatoria desde el 1 de diciembre de 2026).
 *
 * La normativa 2.0 cambia la versión de los esquemas (`identificacion.version`),
 * vuelve obligatorio el distrito (CAT-013) en las direcciones y renombra el
 * bloque del sujeto excluido del FSE de `sujetoExcluido` a `receptor`.
 *
 * El valor por defecto es 2. Para seguir emitiendo con la estructura anterior
 * se puede llamar `set_dte_normative(1)` o pasar `dteVersion` a cada generador.
 */
let dte_normative: 1 | 2 = 2;

/** Normativa activa con la que se generan los documentos. */
export const get_dte_normative = (): 1 | 2 => dte_normative;

/** Cambia la normativa activa (1 = anterior, 2 = normativa 2.0). */
export const set_dte_normative = (version: 1 | 2) => {
  dte_normative = version;
};

/**
 * Versión de `identificacion.version` por tipo de DTE según los esquemas de la
 * normativa 2.0: FE v2, CCF v4, NC/ND v4 (aún no generados por la librería) y
 * FSE v2. Con la normativa anterior se mantienen las versiones históricas.
 */
const DTE_VERSIONS_2: Record<string, number> = {
  "01": 2,
  "03": 4,
  "05": 4,
  "06": 4,
  "14": 2,
};

export const dte_document_version = (tipoDte: string, version?: number): number => {
  const normative = version ?? dte_normative;

  if (normative >= 2) {
    return DTE_VERSIONS_2[tipoDte] ?? 1;
  }

  return tipoDte === "03" ? 3 : 1;
};

/**
 * CAT-013: el distrito se guarda con un dígito ("1") y Hacienda lo exige de
 * dos ("01", "10", "11"). Solo rellena cuando llega un solo dígito.
 */
export const format_distrito = (distrito?: string | number | null): string => {
  const value = String(distrito ?? "").trim();

  if (!value || value === "0" || value === "N/A") return "00";

  return value.padStart(2, "0");
};

interface Direccion {
  departamento: string;
  municipio: string;
  complemento: string;
  distrito?: string | null;
}

/**
 * Dirección del DTE. Con la normativa 2.0 incluye `distrito`; con la anterior
 * se omite porque Hacienda rechaza el campo ("Campo distrito no esta
 * permitido").
 */
export const address_for = (
  direccion: Direccion | null | undefined,
  version?: number
) => {
  const base = {
    departamento: direccion?.departamento ?? "",
    municipio: direccion?.municipio ?? "",
  };

  if ((version ?? dte_normative) >= 2) {
    return {
      ...base,
      distrito: format_distrito(direccion?.distrito),
      complemento: direccion?.complemento ?? "",
    };
  }

  return { ...base, complemento: direccion?.complemento ?? "" };
};
