import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe tags and attributes
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'strong', 'em', 'b', 'i', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption', 'video', 'iframe', 'source',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
      'width', 'height', 'allow', 'allowfullscreen', 'frameborder',
      'loading', 'poster', 'controls', 'autoplay', 'muted', 'loop'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
};

/**
 * Sanitize plain text - strips all HTML tags
 */
export const sanitizeText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Validate and sanitize URLs
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http, https, and mailto protocols
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return '#';
    }
    return url;
  } catch {
    // If it's a relative URL, return as-is
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    return '#';
  }
};
