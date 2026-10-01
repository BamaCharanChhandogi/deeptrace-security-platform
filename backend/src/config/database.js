const knex = require('knex');
const knexConfig = require('../../knexfile');
const env = require('./environment');

const config = knexConfig[env.NODE_ENV] || knexConfig.development;
const db = knex(config);

module.exports = db;
