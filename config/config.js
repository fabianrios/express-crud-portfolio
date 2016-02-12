var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'aram'
    },
    port: 3000,
    db: 'postgres://localhost/aram-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'aram'
    },
    port: 3000,
    db: 'postgres://localhost/aram-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'aram'
    },
    port: 3000,
    db: 'postgres://dxabqydxmjzqcl:QcwfWUa-aOBC8QTr5Y_wFWR3fb@ec2-54-225-223-40.compute-1.amazonaws.com:5432/db4e85r5ehsd6n'
  }
};

module.exports = config[env];
