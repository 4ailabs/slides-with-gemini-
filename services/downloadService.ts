import { Slide } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { APP_CONFIG } from '../constants/config';

// Función auxiliar para esperar a que las imágenes se carguen
function waitForImages(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = Array.from(element.querySelectorAll('img'));
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;
    const timeoutId = setTimeout(() => {
      console.warn('Timeout waiting for images, proceeding anyway');
      resolve();
    }, APP_CONFIG.IMAGE_LOAD_TIMEOUT);

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        clearTimeout(timeoutId);
        resolve();
      }
    };

    images.forEach((img) => {
      // Imágenes base64 ya están cargadas
      if (img.src.startsWith('data:') || img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete; // Continuar aunque falle la carga
      }
    });
  });
}

// Convertir canvas a blob
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

// Descargar un blob como archivo
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Función exportada para convertir elemento a canvas (para uso externo)
export async function htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  if (!element) {
    throw new Error('Elemento inválido para capturar');
  }
  
  // Verificar dimensiones con reintentos
  let width = element.offsetWidth;
  let height = element.offsetHeight;
  
  if (!width || !height) {
    // Esperar un poco más si no hay dimensiones
    await new Promise(resolve => setTimeout(resolve, 200));
    width = element.offsetWidth || APP_CONFIG.SLIDE_WIDTH;
    height = element.offsetHeight || APP_CONFIG.SLIDE_HEIGHT;
  }
  
  if (!width || !height) {
    console.error('Elemento sin dimensiones:', {
      element,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      computedStyle: window.getComputedStyle(element),
    });
    throw new Error('Elemento sin dimensiones válidas para capturar');
  }
  
  // Esperar a que las imágenes se carguen
  await waitForImages(element);
  
  // Esperar un poco más para que todo se renderice (especialmente iconos SVG)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Asegurarnos de que el elemento esté "visible" para html2canvas
  // html2canvas necesita que el elemento tenga visibility: visible (no hidden)
  const originalVisibility = element.style.visibility;
  const originalDisplay = element.style.display;
  
  // Asegurar visibilidad aunque esté fuera del viewport
  if (element.style.visibility === 'hidden') {
    element.style.visibility = 'visible';
  }
  if (element.style.display === 'none') {
    element.style.display = 'block';
  }
  
  // Esperar un frame para que se apliquen los cambios
  await new Promise(resolve => requestAnimationFrame(resolve));
  
  try {
    // Esperar otro frame adicional antes de capturar
    await new Promise(resolve => requestAnimationFrame(resolve));

    console.log('Starting html2canvas capture for element:', {
      tagName: element.tagName,
      width,
      height,
      hasDataAttribute: element.hasAttribute('data-slide-capture'),
      children: element.children.length
    });

    const canvas = await html2canvas(element, {
      backgroundColor: null, // Usar el color de fondo del elemento
      scale: APP_CONFIG.CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true, // Permitir imágenes cross-origin
      logging: true, // Activar logging temporalmente para debug
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      foreignObjectRendering: false, // Evitar foreignObject que causa problemas con iframes
      removeContainer: true, // Permitir que html2canvas limpie el contenedor clonado
      imageTimeout: 15000, // Timeout para cargar imágenes
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        try {
          console.log('html2canvas onclone callback - Preparing cloned document');

          // Asegurar que el documento clonado esté completamente renderizado
          const wrapper = clonedDoc.querySelector('[data-slide-capture]');
          if (!wrapper) {
            console.warn('Warning: Could not find wrapper with data-slide-capture attribute in cloned document');
            return;
          }

          if (wrapper instanceof HTMLElement) {
            console.log('Configuring cloned wrapper element');
            wrapper.style.position = 'relative';
            wrapper.style.visibility = 'visible';
            wrapper.style.display = 'flex';
            wrapper.style.width = `${width}px`;
            wrapper.style.height = `${height}px`;
            wrapper.style.overflow = 'hidden';

            // Asegurar que todos los hijos estén visibles
            const allElements = wrapper.querySelectorAll('*');
            console.log(`Processing ${allElements.length} child elements in cloned document`);

            allElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                if (el.style.visibility === 'hidden') {
                  el.style.visibility = 'visible';
                }
                if (el.style.display === 'none') {
                  el.style.display = 'block';
                }
              }
            });

            console.log('Cloned document prepared successfully');
          }
        } catch (error) {
          console.error('Error in onclone callback:', error);
          throw error;
        }
      },
    });

    console.log('html2canvas capture completed successfully, canvas dimensions:', {
      width: canvas.width,
      height: canvas.height
    });

    return canvas;
  } finally {
    // Restaurar visibilidad original si la cambiamos
    if (originalVisibility) {
      element.style.visibility = originalVisibility;
    }
    if (originalDisplay) {
      element.style.display = originalDisplay;
    }
  }
}

// Descargar todas las slides como PDF
export async function downloadSlidesAsPDF(slides: Slide[], slideElements: HTMLElement[]): Promise<void> {
  if (!slides || slides.length === 0) {
    throw new Error('No hay slides para exportar');
  }
  
  if (slideElements.length !== slides.length) {
    throw new Error('El número de elementos no coincide con el número de slides');
  }
  
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [APP_CONFIG.PDF_WIDTH, APP_CONFIG.PDF_HEIGHT],
    });

    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      if (!slideElement) {
        console.warn(`Slide ${i + 1} no encontrada, saltando...`);
        continue;
      }
      
      // Convertir slide a canvas
      const canvas = await htmlToCanvas(slideElement);
      
      // Agregar página (excepto la primera)
      if (i > 0) {
        pdf.addPage();
      }
      
      // Agregar imagen al PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, APP_CONFIG.PDF_WIDTH, APP_CONFIG.PDF_HEIGHT);
    }

    // Descargar PDF
    pdf.save(APP_CONFIG.DEFAULT_PDF_NAME);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${message}`);
  }
}

// Descargar todas las slides como imágenes PNG
export async function downloadSlidesAsImages(slides: Slide[], slideElements: HTMLElement[]): Promise<void> {
  if (!slides || slides.length === 0) {
    throw new Error('No hay slides para exportar');
  }
  
  if (slideElements.length !== slides.length) {
    throw new Error('El número de elementos no coincide con el número de slides');
  }
  
  try {
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      const slide = slides[i];
      
      if (!slideElement || !slide) {
        console.warn(`Slide ${i + 1} no encontrada, saltando...`);
        continue;
      }
      
      // Convertir slide a canvas
      const canvas = await htmlToCanvas(slideElement);
      
      // Convertir a blob y descargar
      const blob = await canvasToBlob(canvas);
      const safeTitle = slide.title.substring(0, 20).replace(/[^a-z0-9]/gi, '-');
      const filename = `${APP_CONFIG.DEFAULT_IMAGE_PREFIX}-${i + 1}-${safeTitle}.png`;
      downloadBlob(blob, filename);
      
      // Delay para evitar problemas con múltiples descargas
      await new Promise(resolve => setTimeout(resolve, APP_CONFIG.DOWNLOAD_DELAY));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating images:', error);
    throw new Error(`Failed to generate images: ${message}`);
  }
}

// Descargar slide actual como imagen PNG
export async function downloadCurrentSlideAsImage(slideElement: HTMLElement, slide: Slide, index: number): Promise<void> {
  if (!slideElement) {
    throw new Error('Elemento de slide no válido');
  }
  
  if (!slide || !slide.title) {
    throw new Error('Slide no válida');
  }
  
  try {
    const canvas = await htmlToCanvas(slideElement);
    const blob = await canvasToBlob(canvas);
    const safeTitle = slide.title.substring(0, 20).replace(/[^a-z0-9]/gi, '-');
    const filename = `${APP_CONFIG.DEFAULT_IMAGE_PREFIX}-${index + 1}-${safeTitle}.png`;
    downloadBlob(blob, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating image:', error);
    throw new Error(`Failed to generate image: ${message}`);
  }
}

// Exportar slides como PowerPoint
export async function exportToPowerPoint(slides: Slide[], slideCanvases: HTMLCanvasElement[]): Promise<void> {
  if (!slides || slides.length === 0) {
    throw new Error('No hay slides para exportar');
  }
  
  if (slideCanvases.length !== slides.length) {
    throw new Error('El número de canvases no coincide con el número de slides');
  }
  
  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 16:9 aspect ratio
    
    for (let i = 0; i < slides.length; i++) {
      const canvas = slideCanvases[i];
      
      if (!canvas) {
        console.warn(`Canvas ${i + 1} no encontrado, saltando...`);
        continue;
      }
      
      const pptxSlide = pptx.addSlide();
      
      // Convertir canvas a base64
      const imgData = canvas.toDataURL('image/png');
      
      // Agregar como imagen que cubra toda la slide
      pptxSlide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: APP_CONFIG.PPTX_LAYOUT_WIDE_WIDTH,
        h: APP_CONFIG.PPTX_LAYOUT_WIDE_HEIGHT,
      });
    }
    
    // Descargar el archivo
    await pptx.writeFile({ fileName: APP_CONFIG.DEFAULT_PPTX_NAME });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating PowerPoint:', error);
    throw new Error(`Failed to generate PowerPoint file: ${message}`);
  }
}

