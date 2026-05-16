const express = require('express');
const path = require('path');
const { connectDB } = require('./db');
const Listing = require('./models/listing');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();
const port = process.env.PORT || 8080;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.redirect('/listings');
});  
app.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find();
    res.render('listings/index', { listings });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/listings/new', (req, res) => {
  res.render('listings/new');
});

app.post('/listings', async (req, res) => {
  try {
    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(400).send('Unable to create listing. Please check the details and try again.');
  }
});

app.get('/listings/:id/edit', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).send('Listing not found');
    }
    res.render('listings/edit', { listing });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body.listing,
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).send('Listing not found');
    }

    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(400).send('Unable to update listing. Please check the details and try again.');
  }
});

app.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) {
      return res.status(404).send('Listing not found');
    } 
    res.redirect('/listings');
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).send('Listing not found');
    }
    res.render('listings/show', { listing });
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).send('Internal Server Error');
  }
});

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});
