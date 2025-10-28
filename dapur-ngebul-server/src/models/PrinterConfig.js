module.exports = (sequelize, DataTypes) => {
  const PrinterConfig = sequelize.define('PrinterConfig', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    address: DataTypes.STRING,
  }, {
    tableName: 'printer_configs',
    timestamps: false,
  });
  return PrinterConfig;
};
