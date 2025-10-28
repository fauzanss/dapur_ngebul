module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define('Sale', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    date: DataTypes.DATEONLY,
    total: DataTypes.DECIMAL(12,2),
  }, {
    tableName: 'sales_records',
    timestamps: false,
  });
  return Sale;
};
