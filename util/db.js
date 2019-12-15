const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodejs-project', 'root', 'password', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
