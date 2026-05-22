
# Map Integration Guide - WanderLust

## Overview
This guide covers the complete implementation of a professional, Airbnb-style map feature for the WanderLust application.

## Technology Stack
- **Mapping Library**: Leaflet (v1.9.4)
- **Tile Provider**: OpenStreetMap
- **No API Keys Required**: 100% free and reliable

---

## Step 1: Update Data Model (`src/models/listing.js`)

Add a `geometry` field to store location coordinates:

```javascript
geometry: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    default: [77.209, 28.6139]
  }
}
```

---

## Step 2: Add Leaflet Assets to Boilerplate (`views/layouts/boilerplate.ejs`)

### CSS
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

### JavaScript
```html
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

---

## Step 3: Create Geocoder Utility (`src/utils/geocoder.js`)

```javascript
const locationCoords = {
  "Goa": [73.9500, 15.2993],
  "Manali": [77.1887, 32.2432],
  // Add all your locations...
};

function getCoordinates(location, country) {
  for (const key in locationCoords) {
    if (location && location.includes(key)) {
      return locationCoords[key];
    }
    if (country && country.includes(key)) {
      return locationCoords[key];
    }
  }
  return [77.209, 28.6139]; // Default to Delhi
}

module.exports = { getCoordinates };
```

---

## Step 4: Update Listing Controllers (`src/controllers/listings.js`)

### Import Geocoder
```javascript
const { getCoordinates } = require('../utils/geocoder');
```

### Create Listing (Add Coordinates)
```javascript
module.exports.createListing = async (req, res) => {
  const listing = new Listing(req.body.listing);
  if (req.file) {
    listing.image = req.file.path;
  }
  
  const coords = getCoordinates(listing.location, listing.country);
  listing.geometry = {
    type: 'Point',
    coordinates: coords
  };
  
  listing.owner = req.user._id;
  await listing.save();
  req.flash('success', 'New listing created successfully.');
  res.redirect(`/listings/${listing._id}`);
};
```

### Update Listing (Keep Coordinates in Sync)
```javascript
module.exports.updateListing = async (req, res) => {
  const updates = { ...req.body.listing };
  if (req.file) {
    updates.image = req.file.path;
  }

  const coords = getCoordinates(updates.location, updates.country);
  updates.geometry = {
    type: 'Point',
    coordinates: coords
  };

  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!listing) {
    throw new ExpressError(404, 'Listing not found');
  }

  req.flash('success', 'Listing updated successfully.');
  res.redirect(`/listings/${listing._id}`);
};
```

---

## Step 5: Update Listing Show Page (`views/listings/show.ejs`)

### Add Map Container
```html
<div class="listing-location section-divider">
  <h2 class="section-title">Where you'll be</h2>
  <div class="location-map-wrapper">
    <div id="listing-map" class="listing-map"></div>
  </div>
  <div class="location-address">
    <i class="fa-solid fa-location-dot"></i>
    <span><%= listing.location %>, <%= listing.country %></span>
  </div>
</div>
```

### Expose Coordinates to JavaScript
```html
<script>
  const coordinates = listing.geometry && listing.geometry.coordinates 
    ? listing.geometry.coordinates 
    : [77.209, 28.6139];
  window.listingCoordinates = coordinates;
</script>
```

---

## Step 6: Initialize Map in JavaScript (`public/js/listings/show.js`)

```javascript
if (listingMapElement && window.listingCoordinates) {
  const lng = window.listingCoordinates[0];
  const lat = window.listingCoordinates[1];

  const map = L.map('listing-map', {
    scrollWheelZoom: false,
    zoomControl: true
  }).setView([lat, lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #ff385c 0%, #e31c5f 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 8px 20px rgba(227, 28, 95, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  });

  L.marker([lat, lng], { icon: customIcon }).addTo(map);
}
```

---

## Step 7: Add Map Styles (`public/css/listings/show.css`)

```css
.listing-map {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-xl);
  z-index: 1;
}

@media (min-width: 768px) {
  .listing-map {
    height: 450px;
  }
}

.custom-marker {
  background: transparent !important;
  border: none !important;
}
```

---

## Features Summary
1. **No API Keys Needed**: 100% free using OpenStreetMap
2. **Professional Custom Marker**: Airbnb-style with brand colors
3. **Scroll Zoom Disabled**: Better UX for users
4. **Built-in Geocoding**: Automatic coordinate assignment
5. **Responsive Design**: Works on all screen sizes

---

## Future Enhancements
- Add real reverse geocoding API (Nominatim)
- Add cluster map for listings index
- Add search radius filtering
- Add map interactivity (click to view listings)
