// Configuración de la aplicación
export const APP_CONFIG = {
  // Dimensiones de slides
  SLIDE_WIDTH: 1280,
  SLIDE_HEIGHT: 720,
  ASPECT_RATIO: 16 / 9,
  
  // Tiempos de espera (ms)
  RENDER_WAIT_TIME: 800,
  CANVAS_WAIT_TIME: 200,
  DOWNLOAD_DELAY: 300,
  IMAGE_LOAD_TIMEOUT: 5000,
  
  // Escala de captura
  CAPTURE_SCALE: 2,
  
  // Tamaños de PDF
  PDF_WIDTH: 1920,
  PDF_HEIGHT: 1080,
  
  // PowerPoint
  PPTX_LAYOUT_WIDE_WIDTH: 13.33,
  PPTX_LAYOUT_WIDE_HEIGHT: 7.5,
  
  // Nombres de archivos por defecto
  DEFAULT_PDF_NAME: 'slides-presentation.pdf',
  DEFAULT_PPTX_NAME: 'slides-presentation.pptx',
  DEFAULT_IMAGE_PREFIX: 'slide',
  
  // Mensajes
  MESSAGES: {
    GENERATING: 'Generando...',
    GENERATING_PDF: 'Generando PDF...',
    GENERATING_PPTX: 'Generando PowerPoint...',
    GENERATING_IMAGES: 'Generando imágenes...',
    GENERATING_IMAGE: 'Generando imagen...',
    SUCCESS_PDF: 'PDF descargado exitosamente!',
    SUCCESS_PPTX: 'PowerPoint descargado exitosamente!',
    SUCCESS_IMAGES: 'Imágenes descargadas exitosamente!',
    SUCCESS_IMAGE: 'Imagen descargada exitosamente!',
    SUCCESS_SAVED: 'Presentación guardada exitosamente!',
    ERROR_PDF: 'Error al generar PDF.',
    ERROR_PPTX: 'Error al generar PowerPoint.',
    ERROR_IMAGES: 'Error al generar imágenes.',
    ERROR_IMAGE: 'Error al generar imagen.',
    ERROR_SAVE: 'Error al guardar presentación.',
  },
} as const;

// Validación de slides
export function validateSlide(slide: unknown): boolean {
  if (!slide || typeof slide !== 'object') return false;
  const s = slide as Record<string, unknown>;
  
  if (!Array.isArray(s.content)) return false;
  
  // Validar que cada item del content sea string o ContentPoint
  const isContentValid = s.content.every((item: unknown) => {
    if (typeof item === 'string') return true;
    if (typeof item === 'object' && item !== null) {
      const cp = item as Record<string, unknown>;
      return typeof cp.text === 'string' && (cp.icon === undefined || typeof cp.icon === 'string');
    }
    return false;
  });
  
  return (
    typeof s.title === 'string' &&
    isContentValid &&
    ['text-image', 'image-text', 'text-only', 'title-only', 'image-background', 'split-vertical'].includes(s.layout as string)
  );
}

export function validateSlides(slides: unknown): slides is Array<unknown> {
  return Array.isArray(slides) && slides.every(validateSlide);
}

