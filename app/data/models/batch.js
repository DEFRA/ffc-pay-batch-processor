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
    batch.hasOne(models.status, {
      foreignKey: 'statusId',
      as: 'status'
    })
    batch.hasOne(models.scheme, {
      foreignKey: 'schemeId',
      as: 'scheme'
    })
  }
  return batch
}
