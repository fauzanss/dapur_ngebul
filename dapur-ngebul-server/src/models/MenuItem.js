module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(50), unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    category: DataTypes.STRING,
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: 'menu_items',
    timestamps: false,
  });
  return MenuItem;
};
