// ============================================================================
// Generatore di ID univoci
// ============================================================================

/**
 * Genera un ID univoco usando crypto.randomUUID().
 * Supportato nativamente in tutti i browser moderni.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Genera un ID breve (8 caratteri) per visualizzazione.
 */
export function generateShortId(): string {
  return crypto.randomUUID().split('-')[0];
}
