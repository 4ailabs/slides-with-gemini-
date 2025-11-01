/**
 * Procesa un array de items en lotes paralelos con concurrencia limitada
 * @param items - Array de items a procesar
 * @param processFn - Función que procesa cada item
 * @param options - Opciones de configuración
 * @returns Promise con array de resultados
 */
export async function processInBatches<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  options: {
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
    delayBetweenBatches?: number;
  } = {}
): Promise<R[]> {
  const {
    batchSize = 3, // Procesar 3 items a la vez por defecto
    onProgress,
    delayBetweenBatches = 0,
  } = options;

  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, batchIndex) =>
      processFn(item, i + batchIndex)
    );

    // Procesar el lote en paralelo
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Reportar progreso
    if (onProgress) {
      onProgress(results.length, total);
    }

    // Delay opcional entre lotes para no sobrecargar el sistema
    if (delayBetweenBatches > 0 && i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

/**
 * Procesa items con concurrencia limitada usando un pool de workers
 * Mejor para tareas más pesadas como generación de canvas
 * IMPORTANTE: Para exportación de slides, usa concurrencia = 1 para evitar conflictos de DOM
 */
export async function processWithConcurrencyLimit<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 3, onProgress } = options;
  const results: R[] = new Array(items.length);
  const total = items.length;
  let completed = 0;
  let currentIndex = 0;

  // Función worker que procesa items del pool
  const worker = async (): Promise<void> => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];

      if (item === undefined) {
        throw new Error(`Item at index ${index} is undefined`);
      }

      try {
        results[index] = await processFn(item, index);
      } catch (error) {
        console.error(`Error processing item ${index}:`, error);
        throw error;
      }

      completed++;
      if (onProgress) {
        onProgress(completed, total);
      }
    }
  };

  // Crear pool de workers
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () =>
    worker()
  );

  // Esperar a que todos los workers terminen
  await Promise.all(workers);

  return results;
}

/**
 * Procesa items de forma secuencial (uno a la vez)
 * Útil cuando el procesamiento comparte recursos y no puede ser paralelo
 */
export async function processSequentially<T, R>(
  items: T[],
  processFn: (item: T, index: number) => Promise<R>,
  options: {
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { onProgress } = options;
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i++) {
    const result = await processFn(items[i]!, i);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

/**
 * Ejecuta múltiples promesas con un límite de concurrencia
 * Útil cuando ya tienes las promesas creadas
 */
export async function limitConcurrency<T>(
  promiseFns: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const promiseFn of promiseFns) {
    const promise = promiseFn().then((result) => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}
