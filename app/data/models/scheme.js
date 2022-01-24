module.exports = (sequelize, DataTypes) => {
  const scheme = sequelize.define('scheme', {
    schemeId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    scheme: DataTypes.STRING
  },
  {
    tableName: 'schemes',
    freezeTableName: true,
    timestamps: false
  })
  scheme.associate = function (models) {
    scheme.hasOne(models.sequence, {
      foreignKey: 'schemeId',
      as: 'sequence'
    })
    scheme.hasMany(models.batch, {
      foreignKey: 'schemeId',
      as: 'batches'
    })
  }
  return scheme
}
