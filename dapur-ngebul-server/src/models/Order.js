module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_uuid: { type: DataTypes.STRING(36), allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    paid_amount: DataTypes.DECIMAL(12, 2),
    status: { type: DataTypes.STRING(50), defaultValue: 'PENDING' },
    cashier: DataTypes.STRING(100),
    customer_name: DataTypes.STRING(100),
    created_at: { type: DataTypes.DATE, field: 'created_at' },
  }, {
    tableName: 'orders',
    timestamps: false,
  });
  return Order;
};
