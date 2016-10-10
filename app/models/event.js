module.exports = function (sequelize, DataTypes) {

  var Event = sequelize.define('Event', {
    name: DataTypes.STRING,
    text: DataTypes.TEXT,
    category: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    when: DataTypes.DATE,
    publish: {
       type: DataTypes.BOOLEAN,
       defaultValue: false,
       allowNull: false
     },
     confirmation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
  });

  return Event;
};

