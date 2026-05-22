const { cloudinary } = require('../../src/config/cloudinary');

function getSourceImageUrl(listing) {
  if (!listing.image) return null;
  if (typeof listing.image === 'object' && listing.image !== null) {
    return listing.image.url;
  }
  return listing.image;
}

function toPublicId(title, index) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `wanderlust-${index}-${slug}`;
}

async function uploadListingImage(sourceUrl, publicId) {
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: 'Wanderlust',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' },
      { width: 1200, height: 800, crop: 'limit' }
    ]
  });
  return result.secure_url;
}

async function prepareCloudinaryListings(sampleListings) {
  const prepared = [];

  for (let i = 0; i < sampleListings.length; i += 1) {
    const listing = sampleListings[i];
    const sourceUrl = getSourceImageUrl(listing);

    if (!sourceUrl) {
      throw new Error(`Listing "${listing.title}" has no source image URL.`);
    }

    console.log(`Uploading (${i + 1}/${sampleListings.length}): ${listing.title}`);

    const secureUrl = await uploadListingImage(
      sourceUrl,
      toPublicId(listing.title, i + 1)
    );

    prepared.push({
      title: listing.title,
      description: listing.description,
      image: secureUrl,
      price: listing.price,
      location: listing.location,
      country: listing.country,
      category: listing.category
    });
  }

  return prepared;
}

module.exports = { prepareCloudinaryListings, getSourceImageUrl };
