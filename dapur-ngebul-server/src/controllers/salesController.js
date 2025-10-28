const db = require('../models');
const { Op } = require('sequelize');

exports.summary = async (req, res) => {
  try {
    const { date } = req.query;
    const where = date ? { date } : {};
    const totalRow = await db.Sale.findAll({
      attributes: [
        [db.sequelize.fn('COALESCE', db.sequelize.fn('SUM', db.sequelize.col('total')), 0), 'total'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
      ],
      where,
      raw: true,
    });
    const { total, count } = totalRow[0] || { total: 0, count: 0 };
    res.json({ total: Number(total), count: Number(count) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan penjualan', error: String(err) });
  }
};
