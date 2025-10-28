const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(process.env.DB_NAME || 'dapur_ngebul', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  dialect: 'mysql',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.MenuItem = require('./MenuItem')(sequelize, DataTypes);
db.Order = require('./Order')(sequelize, DataTypes);
db.OrderItem = require('./OrderItem')(sequelize, DataTypes);
db.Sale = require('./Sale')(sequelize, DataTypes);
db.PrinterConfig = require('./PrinterConfig')(sequelize, DataTypes);

// Associations

db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id', as: 'items' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' });

db.MenuItem.hasMany(db.OrderItem, { foreignKey: 'menu_item_id' });
db.OrderItem.belongsTo(db.MenuItem, { foreignKey: 'menu_item_id' });

db.Sale.belongsTo(db.Order, { foreignKey: 'order_id' });

module.exports = db;
