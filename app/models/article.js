// Example model


module.exports = function (sequelize, DataTypes) {

  var Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    text: DataTypes.STRING,
    fulltext: DataTypes.TEXT,
    images: DataTypes.JSON,
    cover: DataTypes.STRING,
    version: DataTypes.INTEGER,
    category: DataTypes.JSON,
    vip: DataTypes.INTEGER,
    incognito: DataTypes.INTEGER,
    corporate: DataTypes.INTEGER,
    publish: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
       allowNull: false
     },
     like: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        Article.belongsTo(models.User);
        Article.hasMany(models.Cover);
        // example on how to add relations
        // Article.hasMany(models.Comments);
      }
    }
  });

  return Article;
};

