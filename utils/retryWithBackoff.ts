/**
 * Opciones para la función de retry con backoff exponencial
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Ejecuta una función asíncrona con reintentos automáticos y backoff exponencial
 *
 * @param fn - Función asíncrona a ejecutar
 * @param options - Opciones de configuración para los reintentos
 * @returns Promesa que resuelve con el resultado de la función
 * @throws Error si todos los reintentos fallan
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('https://api.example.com/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = (error: Error) => {
      // Por defecto, reintentar en errores de red y rate limit
      return (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('rate limit') ||
        error.message.includes('timeout') ||
        error.message.includes('503') ||
        error.message.includes('429')
      );
    },
    onRetry = (error, attempt) => {
      console.warn(`Retry attempt ${attempt} after error:`, error.message);
    },
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es el último intento o no deberíamos reintentar, lanzar el error
      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calcular delay con backoff exponencial
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Agregar un poco de jitter (aleatorización) para evitar thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;

      onRetry(lastError, attempt + 1);

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  // TypeScript no sabe que siempre lanzaremos antes de llegar aquí
  throw lastError!;
}

/**
 * Versión simplificada para casos comunes
 * Reintenta 3 veces con delay inicial de 1 segundo
 */
export async function retryAPI<T>(fn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 5000,
  });
}

/**
 * Versión para operaciones críticas que necesitan más reintentos
 */
export async function retryImportant<T>(fn: () => Promise<T>): Promise<T> {
  return retryWithBackoff(fn, {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 15000,
  });
}
