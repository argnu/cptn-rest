// import * as configPrivate from '../config.private';
const configPrivate = require('./config.private');

module.exports = {
  entry: {
    host: configPrivate.host,
    port: 3400
  },
  db: {
    user: configPrivate.user,
    host: configPrivate.host,
    database: configPrivate.database,
    password: configPrivate.password,
    port: 5432,
  },
  dbMssql: {
    user: configPrivate.userSql,
    password: configPrivate.passwordSql,
    server: configPrivate.hostSql,
    database: configPrivate.databaseSql,
    port: configPrivate.portSql,
    requestTimeout: 190000,
    stream: true,
  }
}
