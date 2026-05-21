
function getOptimizedImageUrl(imageUrl, options = {}) {
  if (!imageUrl) return null;

  const {
    width = null,
    height = null,
    crop = 'limit',
    quality = 'auto:good',
    fetchFormat = 'auto'
  } = options;

  if (imageUrl.includes('res.cloudinary.com')) {
    try {
      const url = new URL(imageUrl);
      let pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');

      if (uploadIndex !== -1) {
        let afterUploadIndex = uploadIndex + 1;

        while (afterUploadIndex < pathParts.length && pathParts[afterUploadIndex].includes(',')) {
          pathParts.splice(afterUploadIndex, 1);
        }

        const transformationParts = [];
        transformationParts.push(`q_${quality}`);
        transformationParts.push(`f_${fetchFormat}`);
        if (width) transformationParts.push(`w_${width}`);
        if (height) transformationParts.push(`h_${height}`);
        if (width || height) transformationParts.push(`c_${crop}`);

        pathParts.splice(uploadIndex + 1, 0, transformationParts.join(','));
        url.pathname = pathParts.join('/');
        return url.toString();
      }
    } catch (e) {
      return imageUrl;
    }
  }

  return imageUrl;
}

function getCardImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return getOptimizedImageUrl(imageUrl, {
    width: 400,
    height: 300,
    crop: 'fill'
  });
}

function getShowImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return getOptimizedImageUrl(imageUrl, {
    width: 1200,
    height: 800,
    crop: 'limit'
  });
}

module.exports = {
  getOptimizedImageUrl,
  getCardImageUrl,
  getShowImageUrl
};
