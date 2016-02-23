// Example model


module.exports = function (sequelize, DataTypes) {

  var Country = sequelize.define('Country', {
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    text: DataTypes.TEXT,
    cover: DataTypes.STRING,
    version: DataTypes.INTEGER,
    lat: DataTypes.FLOAT,
    long: DataTypes.FLOAT,
    category: DataTypes.JSON,
    vip: DataTypes.INTEGER,
    incognito: DataTypes.STRING,
    corporate: DataTypes.STRING,
    publish: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
       allowNull: false
     },
     like: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        Country.hasMany(models.Article);
      }
    }
  });

  return Country;
};

