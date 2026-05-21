if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { connectDB } = require('./src/config/database');
const app = require('./src/app');

const port = process.env.PORT || 8080;

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
