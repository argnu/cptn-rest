import * as configPrivate from '../config.private';

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
  }
}
