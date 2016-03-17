module.exports = function (sequelize, DataTypes) {

  var Cover = sequelize.define('Cover', {
    public_id: DataTypes.STRING,
    version: DataTypes.STRING,
    orden: DataTypes.INTEGER,
    home: {
       type: DataTypes.BOOLEAN,
       defaultValue: true,
       allowNull: false
     },
  }, {
    classMethods: {
      associate: function (models) {
        Cover.belongsTo(models.Article);
        // example on how to add relations
      }
    }
  });

  return Cover;
};


