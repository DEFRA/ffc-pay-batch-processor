module.exports = (sequelize, DataTypes) => {
  const batch = sequelize.define('batch', {
    batchId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: DataTypes.STRING,
    sequenceNumber: DataTypes.INTEGER,
    schemeId: DataTypes.INTEGER,
    statusId: DataTypes.INTEGER,
    processedOn: DataTypes.DATE,
    processingTries: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    tableName: 'batches',
    freezeTableName: true
  })
  batch.associate = function (models) {
    batch.belongsTo(models.status, {
      foreignKey: 'statusId',
      as: 'status'
    })
    batch.belongsTo(models.scheme, {
      foreignKey: 'schemeId',
      as: 'scheme'
    })
  }
  return batch
}
