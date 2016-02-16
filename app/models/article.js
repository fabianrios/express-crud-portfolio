// Example model


module.exports = function (sequelize, DataTypes) {

  var Article = sequelize.define('Article', {
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    text: DataTypes.STRING,
    fulltext: DataTypes.TEXT,
    images: DataTypes.JSON,
    cover: DataTypes.STRING,
    category: DataTypes.JSON,
    publish: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
       allowNull: false
     }
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
        // Article.hasMany(models.Comments);
      }
    }
  });

  return Article;
};

