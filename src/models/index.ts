
const Sequelize = require('sequelize');
const seq = new Sequelize('sqlite::memory:');;

const User = require('./User')(seq, Sequelize.DataTypes);
const Bet = require('./Bet')(seq, Sequelize.DataTypes);

Bet.associate(seq);
User.associate(seq);

const db = { seq, Sequelize, Bet, User }

export default db;