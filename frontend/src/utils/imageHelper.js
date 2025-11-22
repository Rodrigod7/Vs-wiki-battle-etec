// frontend/src/utils/imageHelper.js

export const getValidImageUrl = (url) => {
  // 1. Si no hay URL, devolver placeholder
  if (!url) return 'https://placehold.co/400x600?text=Sin+Imagen';

  // 2. Si es una URL de placeholder (placehold.co o via.placeholder), devolverla tal cual
  if (url.includes('placehold.co') || url.includes('via.placeholder')) {
    return url;
  }

  // 3. Si es una URL absoluta que apunta a localhost, convertirla a relativa
  // Ej: http://localhost:4000/uploads/foto.jpg  ->  /uploads/foto.jpg
  if (url.includes('localhost')) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname; // Devuelve solo la parte '/uploads/...'
    } catch (e) {
      console.error('Error parseando URL:', e);
      return url;
    }
  }

  // 4. Si ya es relativa (empieza con /), devolverla tal cual
  if (url.startsWith('/')) {
    return url;
  }

  // 5. Caso por defecto (URLs externas reales, etc.)
  return url;
};