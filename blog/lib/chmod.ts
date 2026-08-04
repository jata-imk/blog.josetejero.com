/**
 * Formato octal aceptado por el bloque `chmodCalculator` y su componente de
 * render: 3 dígitos (permisos) o 4 (permisos + setuid/setgid/sticky).
 * Compartido entre el editor (Payload) y el cliente para que ambos acepten
 * exactamente el mismo formato.
 */
export const OCTAL_MODE = /^[0-7]{3,4}$/

/** Un octal de 4 dígitos con el primero distinto de 0 trae bits especiales. */
export function octalHasSpecialBits(value: string): boolean {
  return value.length === 4 && value[0] !== '0'
}
