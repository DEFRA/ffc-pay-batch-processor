module.exports = (sequelize, DataTypes) => {
  return sequelize.define('lock', {
    locked: DataTypes.DATE
  },
  {
    tableName: 'lock',
    freezeTableName: true,
    timestamps: false
  })
}
