'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable('articles', { id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            createdAt: {
              type: Sequelize.DATE
            },
            updatedAt: {
              type: Sequelize.DATE
            },
            title: Sequelize.STRING,
            url: Sequelize.STRING,
            text: Sequelize.STRING,
            fulltext: Sequelize.TEXT,
            images: Sequelize.JSON
            cover: Sequelize.STRING,
            publish: {
              type: Sequelize.BOOLEAN,
              defaultValue: false,
              allowNull: false
            }
       });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('articles');
  }
};