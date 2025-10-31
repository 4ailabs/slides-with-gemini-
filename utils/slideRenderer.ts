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
  // Limpiar contenedor
  container.innerHTML = '';
  
  const slideDiv = document.createElement('div');
  slideDiv.style.width = `${width}px`;
  slideDiv.style.height = `${height}px`;
  slideDiv.style.position = 'relative';
  container.appendChild(slideDiv);
  
  const root = document.createElement('div');
  root.style.width = '100%';
  root.style.height = '100%';
  slideDiv.appendChild(root);
  
  const { createRoot } = await import('react-dom/client');
  const slideRoot = createRoot(root);
  const SlideComponent = (await import('../components/Slide')).default;
  
  slideRoot.render(
    React.createElement(SlideComponent, {
      slide,
      theme,
      fontSettings,
    })
  );
  
  // Esperar renderizado completo
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Forzar reflow
  slideDiv.offsetHeight;
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return slideDiv;
}

