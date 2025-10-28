const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { category } = req.query || {};
    const where = category ? { category } : undefined;
    const items = await db.MenuItem.findAll({ where, order: [['id', 'ASC']] });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil menu', error: String(err) });
  }
};

exports.categories = async (_req, res) => {
  try {
    const [rows] = await db.sequelize.query(
      "SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC"
    );
    const categories = rows.map(r => r.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: String(err) });
  }
};
