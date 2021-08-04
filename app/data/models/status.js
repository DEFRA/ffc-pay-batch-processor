module.exports = (sequelize, DataTypes) => {
  const status = sequelize.define('status', {
    statusId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status: DataTypes.STRING
  },
  {
    tableName: 'statuses',
    freezeTableName: true,
    timestamps: false
  })
  status.associate = function (models) {
    status.hasMany(models.batch, {
      foreignKey: 'statusId',
      as: 'batches'
    })
  }
  return status
}
