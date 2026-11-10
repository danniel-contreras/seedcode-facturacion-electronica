/**
 * Tipo estructural para el token de cancelación de axios.
 *
 * Evita que la API pública dependa de la copia de axios del paquete: si el
 * consumidor tiene su propio axios, las clases de axios no son compatibles
 * entre sí (tienen miembros privados) y aparecía el error TS2345.
 */
export type CancelTokenSourceLike = { token: any };
