/**
 * Servicio para extraer contenido de URLs
 */

interface UrlContentResult {
  title: string;
  content: string;
  error?: string;
}

/**
 * Extrae el contenido de una URL usando diferentes métodos
 */
export async function extractContentFromUrl(url: string): Promise<UrlContentResult> {
  try {
    // Validar URL
    const urlObj = new URL(url);

    // Intentar fetch directo (puede fallar por CORS)
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return parseHtmlContent(html, urlObj.hostname);
    } catch (fetchError) {
      // Si falla por CORS, intentar usar un proxy CORS público
      console.warn('Direct fetch failed, trying CORS proxy:', fetchError);

      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const proxyResponse = await fetch(proxyUrl);

        if (!proxyResponse.ok) {
          throw new Error(`Proxy error! status: ${proxyResponse.status}`);
        }

        const html = await proxyResponse.text();
        return parseHtmlContent(html, urlObj.hostname);
      } catch (proxyError) {
        console.error('Proxy fetch failed:', proxyError);
        throw new Error('No se pudo acceder a la URL. Por favor, copia y pega el contenido manualmente.');
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      throw new Error('URL inválida. Por favor, verifica el formato.');
    }
    throw error;
  }
}

/**
 * Parsea HTML y extrae el contenido relevante
 */
function parseHtmlContent(html: string, hostname: string): UrlContentResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extraer título
  let title = doc.querySelector('title')?.textContent || '';

  // Intentar obtener meta description
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content');

  // Intentar obtener el contenido principal
  let content = '';

  // Buscar artículos o contenido principal
  const articleSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.post-content',
    '.article-content',
    '#content',
    '.entry-content',
  ];

  let mainElement: Element | null = null;
  for (const selector of articleSelectors) {
    mainElement = doc.querySelector(selector);
    if (mainElement) break;
  }

  if (mainElement) {
    // Extraer texto de párrafos y encabezados
    const paragraphs = mainElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const textContent: string[] = [];

    paragraphs.forEach((element) => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) {
        textContent.push(text);
      }
    });

    content = textContent.join('\n\n');
  } else {
    // Fallback: extraer todos los párrafos del body
    const paragraphs = doc.querySelectorAll('body p');
    const textContent: string[] = [];

    paragraphs.forEach((p) => {
      const text = p.textContent?.trim();
      if (text && text.length > 20) {
        textContent.push(text);
      }
    });

    content = textContent.join('\n\n');
  }

  // Si no hay contenido suficiente, incluir meta description
  if (content.length < 200 && metaDescription) {
    content = metaDescription + '\n\n' + content;
  }

  // Limpiar título
  title = title.replace(/\s+/g, ' ').trim();

  // Limpiar contenido
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();

  // Validar que tenemos contenido útil
  if (content.length < 50) {
    throw new Error('No se pudo extraer suficiente contenido de la URL. Por favor, copia y pega el texto manualmente.');
  }

  return {
    title,
    content,
  };
}

/**
 * Detecta si una URL es de un servicio conocido y extrae el contenido apropiadamente
 */
export function detectUrlType(url: string): 'youtube' | 'pdf' | 'docs' | 'generic' {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }

  if (urlLower.endsWith('.pdf')) {
    return 'pdf';
  }

  if (urlLower.includes('docs.google.com') || urlLower.includes('drive.google.com')) {
    return 'docs';
  }

  return 'generic';
}
