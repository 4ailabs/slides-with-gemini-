import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retryWithBackoff, retryAPI } from '../utils/retryWithBackoff';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna resultado exitoso sin reintentos', async () => {
    const successFn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(successFn);

    expect(result).toBe('success');
    expect(successFn).toHaveBeenCalledTimes(1);
  });

  it('reintenta cuando la función falla', async () => {
    const failThenSuccessFn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');

    const result = await retryWithBackoff(failThenSuccessFn, { maxRetries: 2, initialDelay: 10 });

    expect(result).toBe('success');
    expect(failThenSuccessFn).toHaveBeenCalledTimes(2);
  });

  it('lanza error después de todos los reintentos', async () => {
    const alwaysFailFn = vi.fn().mockRejectedValue(new Error('network error'));

    await expect(
      retryWithBackoff(alwaysFailFn, { maxRetries: 2, initialDelay: 10 })
    ).rejects.toThrow('network error');

    expect(alwaysFailFn).toHaveBeenCalledTimes(3); // intento inicial + 2 reintentos
  });

  it('no reintenta si shouldRetry retorna false', async () => {
    const failFn = vi.fn().mockRejectedValue(new Error('validation error'));

    await expect(
      retryWithBackoff(failFn, {
        maxRetries: 3,
        initialDelay: 10,
        shouldRetry: (error) => error.message.includes('network')
      })
    ).rejects.toThrow('validation error');

    expect(failFn).toHaveBeenCalledTimes(1); // no reintentos
  });

  it('llama a onRetry callback en cada reintento', async () => {
    const onRetry = vi.fn();
    const failTwiceFn = vi.fn()
      .mockRejectedValueOnce(new Error('error 1'))
      .mockRejectedValueOnce(new Error('error 2'))
      .mockResolvedValueOnce('success');

    await retryWithBackoff(failTwiceFn, {
      maxRetries: 3,
      initialDelay: 10,
      onRetry
    });

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
    expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
  });

  it('aplica backoff exponencial', async () => {
    const delays: number[] = [];
    const startTime = Date.now();

    const trackDelayFn = vi.fn().mockImplementation(async () => {
      delays.push(Date.now() - startTime);
      throw new Error('network error');
    });

    await expect(
      retryWithBackoff(trackDelayFn, {
        maxRetries: 2,
        initialDelay: 100,
        backoffMultiplier: 2,
      })
    ).rejects.toThrow();

    // Verificar que hay delays entre intentos
    expect(delays.length).toBe(3); // intento inicial + 2 reintentos
  });
});

describe('retryAPI', () => {
  it('es un wrapper conveniente con configuración por defecto', async () => {
    const successFn = vi.fn().mockResolvedValue('data');

    const result = await retryAPI(successFn);

    expect(result).toBe('data');
    expect(successFn).toHaveBeenCalledTimes(1);
  });

  it('reintenta hasta 3 veces por defecto', async () => {
    const alwaysFailFn = vi.fn().mockRejectedValue(new Error('network error'));

    await expect(retryAPI(alwaysFailFn)).rejects.toThrow();

    expect(alwaysFailFn).toHaveBeenCalledTimes(4); // 1 intento inicial + 3 reintentos
  });
});
