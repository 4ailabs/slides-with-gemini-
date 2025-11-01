import React from 'react';
import { Slide as SlideType, ThemeName, FontSettings } from '../types';

/**
 * Renderiza una slide temporalmente fuera del viewport para captura
 * @returns El elemento DOM de la slide renderizada
 */
export async function renderSlideForCapture(
  slide: SlideType,
  theme: ThemeName,
  fontSettings: FontSettings,
  container: HTMLElement,
  width: number = 1280,
  height: number = 720
): Promise<HTMLElement> {
  // Validar parámetros
  if (!slide) {
    throw new Error('Slide no válida para renderizar');
  }
  
  if (!width || width <= 0) {
    width = 1280;
  }
  if (!height || height <= 0) {
    height = 720;
  }
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  // Asegurarnos de que el contenedor tenga dimensiones válidas
  if (!container.offsetWidth || !container.offsetHeight) {
    // Si el contenedor no tiene dimensiones, forzarlas
    container.style.width = container.style.width || `${width}px`;
    container.style.height = container.style.height || `${height}px`;
    
    // Esperar un frame para que se apliquen los estilos
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  
  // Crear wrapper con dimensiones fijas para que Tailwind w-full funcione
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-slide-capture', 'true'); // Para que html2canvas pueda encontrarlo
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = 'flex'; // Asegurar que el flex funcione
  container.appendChild(wrapper);
  
  // Verificar que el wrapper tenga dimensiones antes de continuar
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  if (!wrapper.offsetWidth || !wrapper.offsetHeight) {
    console.error('Wrapper sin dimensiones:', {
      wrapperWidth: wrapper.offsetWidth,
      wrapperHeight: wrapper.offsetHeight,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
      width,
      height,
    });
    throw new Error('Wrapper creado sin dimensiones válidas');
  }
  
  const slideDiv = document.createElement('div');
  slideDiv.style.width = '100%';
  slideDiv.style.height = '100%';
  slideDiv.style.display = 'flex'; // Asegurar que el flex del Slide funcione
  wrapper.appendChild(slideDiv);
  
  // Renderizar en slideDiv usando una promesa para esperar el render completo
  const { createRoot } = await import('react-dom/client');
  const slideRoot = createRoot(slideDiv);
  const SlideComponent = (await import('../components/Slide')).default;

  // Renderizar y esperar a que React termine
  await new Promise<void>((resolve) => {
    slideRoot.render(
      React.createElement(SlideComponent, {
        slide,
        theme,
        fontSettings,
        isCapture: true, // Indica que es para exportación, usa <img> en lugar de LazyImage
      })
    );
    // Esperar a que React termine el render inicial
    setTimeout(resolve, 100);
  });

  // Esperar renderizado completo con intentos adicionales
  // Aumentamos el tiempo para que los iconos SVG se rendericen
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Forzar múltiples reflows para asegurar renderizado completo de SVGs
  for (let i = 0; i < 5; i++) {
    wrapper.offsetHeight; // Forzar reflow del wrapper
    slideDiv.offsetHeight; // Forzar reflow del slideDiv
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Guardar referencia al root para limpieza posterior
  (wrapper as any).__slideRoot = slideRoot;
  
  // Verificar dimensiones del wrapper (tiene dimensiones fijas)
  // y del slideDiv (debería tenerlas después del renderizado)
  if (!wrapper.offsetWidth || !wrapper.offsetHeight) {
    console.error('Wrapper sin dimensiones después del renderizado:', {
      wrapperWidth: wrapper.offsetWidth,
      wrapperHeight: wrapper.offsetHeight,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
      slideTitle: slide.title,
    });
    throw new Error('Wrapper sin dimensiones válidas después del renderizado');
  }
  
  // Verificar que slideDiv tenga dimensiones (debería ser 100% del wrapper)
  const slideDivWidth = slideDiv.offsetWidth;
  const slideDivHeight = slideDiv.offsetHeight;
  
  if (!slideDivWidth || !slideDivHeight) {
    console.error('Slide sin dimensiones:', {
      slideDivWidth,
      slideDivHeight,
      wrapperWidth: wrapper.offsetWidth,
      wrapperHeight: wrapper.offsetHeight,
      computedStyle: window.getComputedStyle(slideDiv),
      slideTitle: slide.title,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
    });
    throw new Error('Slide renderizada sin dimensiones válidas');
  }
  
  // Retornar el wrapper ya que tiene dimensiones fijas y contiene todo
  return wrapper;
}

