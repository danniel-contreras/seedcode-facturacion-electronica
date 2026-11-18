/**
 * Normativa de cumplimiento de DTE versión 2.0 del Ministerio de Hacienda.
 *
 * Esta versión de la librería emite únicamente con la normativa 2.0: no existe
 * un selector ni una rama para la estructura anterior. `set_dte_normative` y
 * los parámetros `dteVersion`/`version` se conservan por compatibilidad de API,
 * pero se ignoran.
 *
 * La normativa 2.0 cambia la versión de los esquemas (`identificacion.version`),
 * vuelve obligatorio el distrito (CAT-013) en las direcciones y renombra el
 * bloque del sujeto excluido del FSE de `sujetoExcluido` a `receptor`.
 */

/**
 * Versión de `identificacion.version` por tipo de DTE según los esquemas de la
 * normativa 2.0: FE v2, CCF v4, NC/ND v4 y FSE v2.
 */
const DTE_VERSIONS_2: Record<string, number> = {
  "01": 2,
  "03": 4,
  "05": 4,
  "06": 4,
  "14": 2,
};

/** Normativa activa: siempre 2.0. */
export const get_dte_normative = (): 2 => 2;

/**
 * @deprecated La normativa 2.0 es la única soportada; no tiene efecto.
 * Se conserva para que los consumidores que la llaman sigan compilando.
 */
export const set_dte_normative = (_version: 1 | 2): void => {
  /* no-op */
};

/** Versión del esquema del DTE según la normativa 2.0. */
export const dte_document_version = (
  tipoDte: string,
  _version?: number
): number => DTE_VERSIONS_2[tipoDte] ?? 2;

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

/** Dirección del DTE con la normativa 2.0 (siempre incluye `distrito`). */
export const address_for = (
  direccion: Direccion | null | undefined,
  _version?: number
) => ({
  departamento: direccion?.departamento ?? "",
  municipio: direccion?.municipio ?? "",
  distrito: format_distrito(direccion?.distrito),
  complemento: direccion?.complemento ?? "",
});
