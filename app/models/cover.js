module.exports = function (sequelize, DataTypes) {

  var Cover = sequelize.define('User', {
    name: DataTypes.STRING,
    version: DataTypes.STRING,
    orden: DataTypes.INTEGER,
    publish: {
       type: DataTypes.BOOLEAN,
       defaultValue: true,
       allowNull: false
     },
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
      }
    }
  });

  return Cover;
};

