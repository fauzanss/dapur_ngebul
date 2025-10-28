const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./src/models');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/sales', require('./src/routes/sales'));

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

async function start() {
  const port = process.env.PORT || 3001;
  try {
    await db.sequelize.authenticate();
    console.log('DB connected');
    app.listen(port, () => console.log(`API listening on :${port}`));
  } catch (e) {
    console.error('Failed to start', e);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = app;
