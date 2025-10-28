module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    menu_item_id: { type: DataTypes.INTEGER, allowNull: false },
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL(10,2),
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    note: DataTypes.TEXT,
  }, {
    tableName: 'order_items',
    timestamps: false,
  });
  return OrderItem;
};
