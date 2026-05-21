# Multipart Image Upload Implementation Plan and Flow

## Goal
Replace image URL-based listing input with local file uploads from the user system using `multipart/form-data`, and make backend parse files correctly.

## Complete Change Inventory (for review)
These are all code pieces changed for this multipart upload implementation:

1. `src/middleware/uploadListingImage.js` - multer storage + file filter
2. `src/routes/listings.js` - apply upload middleware to create/update routes
3. `src/controllers/listings.js` - save Cloudinary URL into `listing.image`
4. `views/listings/new.ejs` - form `enctype` + file input
5. `views/listings/edit.ejs` - form `enctype` + file input
6. `src/config/cloudinary.js` - Cloudinary + multer-storage-cloudinary
7. `src/app.js` - static serving for `/uploads` (legacy local images)
8. `package-lock.json` - auto-updated by npm install

Note: This repo has other unrelated modified files in the working tree from before this task; they are not part of this upload feature flow.

## Implementation Plan
1. Add multipart parser middleware (`multer`) for listing image uploads.
2. Store uploaded files in a temporary project folder: `uploads/`.
3. Update listing create/edit forms to use:
   - `enctype="multipart/form-data"`
   - `<input type="file" name="image">`
4. Update listing routes to run multer before validation/controller logic.
5. Update controllers to save uploaded image path (`/uploads/<filename>`) into `listing.image`.
6. Expose uploaded files via static route in app bootstrap:
   - `/uploads` -> `<project-root>/uploads`

---

## Flowwise Implementation (Request Lifecycle)

## 1) Frontend Form Submission
User submits listing form from `new.ejs` or `edit.ejs`:

```html
<form action="/listings" method="POST" enctype="multipart/form-data">
  <input type="file" id="image" name="image" accept="image/*" />
</form>
```

For edit:

```html
<form action="/listings/<%= listing._id %>?_method=PUT" method="POST" enctype="multipart/form-data">
  <input type="file" id="image" name="image" accept="image/*" />
</form>
```

Because the form is multipart, text fields come in `req.body` and file comes in `req.file`.

---

## 2) Route Middleware Chain
Routes apply middleware in this order:
1. auth (`isLoggedIn`, `isOwner`)
2. upload parser (`uploadListingImage.single('image')`)
3. Joi validation (`validateListing`)
4. controller (`createListing` / `updateListing`)

```js
router.post(
  '/',
  isLoggedIn,
  uploadListingImage.single('image'),
  validateListing,
  wrapAsync(listings.createListing)
);

router.put(
  '/:id',
  isLoggedIn,
  isOwner,
  uploadListingImage.single('image'),
  validateListing,
  wrapAsync(listings.updateListing)
);
```

---

## 3) Multer Upload Middleware
Middleware file: `src/middleware/uploadListingImage.js`

```js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `listing-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed.'), false);
};

module.exports = multer({ storage, fileFilter });
```

This ensures files are saved locally and only image MIME types pass.

---

## 4) Controller Logic
Controller checks `req.file`. If present, it stores URL path in DB.

```js
// create
const listing = new Listing(req.body.listing);
if (req.file) {
  listing.image = `/uploads/${req.file.filename}`;
}
listing.owner = req.user._id;
await listing.save();
```

```js
// update
const updates = { ...req.body.listing };
if (req.file) {
  updates.image = `/uploads/${req.file.filename}`;
}

const listing = await Listing.findByIdAndUpdate(req.params.id, updates, {
  new: true,
  runValidators: true,
});
```

If no file is sent on edit, image stays unchanged.

---

## 5) Static File Serving
Server exposes uploaded files:

```js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

So DB value like `/uploads/listing-12345.png` is directly accessible in browser.

---

## End-to-End Summary
- Form submits multipart request.
- Multer extracts file and stores it in temporary `uploads/`.
- Controller stores relative file URL in `listing.image`.
- View renders that image URL.
- Express static middleware serves the image from disk.
