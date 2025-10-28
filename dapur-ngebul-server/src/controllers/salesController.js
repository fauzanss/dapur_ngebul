const db = require('../models');
const { Op } = require('sequelize');

exports.summary = async (req, res) => {
  try {
    const { date } = req.query;
    const replacements = {};
    let whereDate = '';
    if (date) {
      whereDate = 'AND s.date = :date';
      replacements.date = date;
    }
    const [rows] = await db.sequelize.query(
      `SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count
       FROM sales_records s
       JOIN orders o ON o.id = s.order_id
       WHERE o.status = 'PAID' ${whereDate}`,
      { replacements }
    );
    const row = rows[0] || { total: 0, count: 0 };
    res.json({ total: Number(row.total), count: Number(row.count) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan penjualan', error: String(err) });
  }
};

exports.today = async (_req, res) => {
  try {
    const [rows] = await db.sequelize.query(
      "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count FROM sales_records s JOIN orders o ON o.id=s.order_id WHERE s.date = CURDATE() AND o.status='PAID'"
    );
    const row = rows[0] || { total: 0, count: 0 };
    res.json({ total: Number(row.total), count: Number(row.count) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil penjualan hari ini', error: String(err) });
  }
};

exports.monthToDate = async (_req, res) => {
  try {
    const [rows] = await db.sequelize.query(
      "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count FROM sales_records s JOIN orders o ON o.id=s.order_id WHERE YEAR(s.date)=YEAR(CURDATE()) AND MONTH(s.date)=MONTH(CURDATE()) AND o.status='PAID'"
    );
    const row = rows[0] || { total: 0, count: 0 };
    res.json({ total: Number(row.total), count: Number(row.count) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil penjualan bulan ini', error: String(err) });
  }
};

exports.allTime = async (_req, res) => {
  try {
    const [rows] = await db.sequelize.query(
      "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count FROM sales_records s JOIN orders o ON o.id=s.order_id WHERE o.status='PAID'"
    );
    const row = rows[0] || { total: 0, count: 0 };
    res.json({ total: Number(row.total), count: Number(row.count) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil total penjualan keseluruhan', error: String(err) });
  }
};

exports.range = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate dan endDate diperlukan' });
    }

    const replacements = {
      startDate,
      endDate
    };

    const [rows] = await db.sequelize.query(
      `SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count
       FROM sales_records s
       JOIN orders o ON o.id = s.order_id
       WHERE o.status = 'PAID' 
       AND s.date >= :startDate 
       AND s.date <= :endDate`,
      { replacements }
    );

    const row = rows[0] || { total: 0, count: 0 };
    res.json({
      total: Number(row.total),
      count: Number(row.count),
      startDate,
      endDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil penjualan berdasarkan range', error: String(err) });
  }
};
