// Example model


module.exports = function (sequelize, DataTypes) {

  var Client = sequelize.define('Client', {
    name: DataTypes.STRING,
    mail: DataTypes.STRING,
    country: DataTypes.STRING,
    experience: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    flag: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function (models) {
        // example on how to add relations
      }
    }
  });

  return Client;
};

