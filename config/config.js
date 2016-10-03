var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    dialect: 'postgresql',
    username: 'frios',
    password: '',
    app: {
      name: 'bahamon'
    },
    port: process.env.PORT || 3000,
    db: 'postgres://localhost/aram-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'bahamon'
    },
    port: process.env.PORT || 3000,
    db: 'postgres://localhost/aram-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'bahamon'
    },
    port: process.env.PORT || 3000,
    db: process.env.DATABASE_URL
  }
};
module.exports = config[env];
