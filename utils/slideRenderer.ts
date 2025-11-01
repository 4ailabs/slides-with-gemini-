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
  
  // Crear wrapper con dimensiones fijas para que Tailwind w-full funcione
  const wrapper = document.createElement('div');
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  container.appendChild(wrapper);
  
  const slideDiv = document.createElement('div');
  slideDiv.style.width = '100%';
  slideDiv.style.height = '100%';
  wrapper.appendChild(slideDiv);
  
  // Renderizar en slideDiv
  const { createRoot } = await import('react-dom/client');
  const slideRoot = createRoot(slideDiv);
  const SlideComponent = (await import('../components/Slide')).default;
  
  slideRoot.render(
    React.createElement(SlideComponent, {
      slide,
      theme,
      fontSettings,
    })
  );
  
  // Esperar renderizado completo con intentos adicionales
  // Aumentamos el tiempo para que los iconos SVG se rendericen
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Forzar múltiples reflows para asegurar renderizado completo de SVGs
  for (let i = 0; i < 5; i++) {
    slideDiv.offsetHeight;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Verificar dimensiones antes de retornar
  if (!slideDiv.offsetWidth || !slideDiv.offsetHeight) {
    console.error('Slide sin dimensiones:', {
      width: slideDiv.offsetWidth,
      height: slideDiv.offsetHeight,
      computedStyle: window.getComputedStyle(slideDiv),
      slideTitle: slide.title,
      containerWidth: container.offsetWidth,
      containerHeight: container.offsetHeight,
    });
    throw new Error('Slide renderizada sin dimensiones válidas');
  }
  
  return slideDiv;
}

