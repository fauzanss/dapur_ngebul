const db = require('../models');

exports.create = async (req, res) => {
  const { order_uuid, cashier, items = [], paid_amount, customer_name } = req.body || {};
  if (!order_uuid || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'order_uuid dan items wajib' });
  }
  const t = await db.sequelize.transaction();
  try {
    let total = 0;
    const menuIds = items.map(i => i.menu_item_id);
    const menuMap = new Map();
    const menuList = await db.MenuItem.findAll({ where: { id: menuIds } });
    menuList.forEach(m => menuMap.set(m.id, m));

    items.forEach(i => {
      const mi = menuMap.get(i.menu_item_id);
      const price = i.price ?? (mi ? Number(mi.price) : 0);
      total += price * (i.quantity || 1);
    });

    const order = await db.Order.create({ order_uuid, cashier, total_amount: total, paid_amount: paid_amount ?? null, status: 'COOKING', customer_name: customer_name || null }, { transaction: t });

    for (const i of items) {
      const mi = menuMap.get(i.menu_item_id);
      await db.OrderItem.create({
        order_id: order.id,
        menu_item_id: i.menu_item_id,
        name: i.name || (mi ? mi.name : ''),
        price: i.price ?? (mi ? mi.price : 0),
        quantity: i.quantity || 1,
        note: i.note || null,
      }, { transaction: t });
    }

    await db.Sale.create({ order_id: order.id, date: new Date(), total }, { transaction: t });
    await t.commit();

    const withItems = await db.Order.findByPk(order.id, { include: { model: db.OrderItem, as: 'items' } });
    res.status(201).json(withItems);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal membuat order', error: String(err) });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, { include: { model: db.OrderItem, as: 'items' } });
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil order', error: String(err) });
  }
};

exports.listByDate = async (req, res) => {
  try {
    const { date } = req.query;
    let where = {};
    if (date) {
      where = db.sequelize.literal(`DATE(created_at)='${date}'`);
    }
    const orders = await db.Order.findAll({
      where,
      include: { model: db.OrderItem, as: 'items' },
      order: [['id', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil daftar order', error: String(err) });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status wajib' });
    status = String(status).toUpperCase();
    const allowed = new Set(['COOKING', 'DELIVERED', 'CANCELLED', 'PAID']);
    if (!allowed.has(status)) return res.status(400).json({ message: 'status tidak valid' });
    const order = await db.Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    order.status = status;
    await order.save();
    const withItems = await db.Order.findByPk(id, { include: { model: db.OrderItem, as: 'items' } });
    res.json(withItems);
  } catch (err) {
    res.status(500).json({ message: 'Gagal update status order', error: String(err) });
  }
};
