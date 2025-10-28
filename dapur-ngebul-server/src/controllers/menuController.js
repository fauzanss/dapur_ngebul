const db = require('../models');

exports.list = async (req, res) => {
  try {
    const items = await db.MenuItem.findAll({ order: [['id','ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil menu', error: String(err) });
  }
};
