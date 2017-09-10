const { Pool, Client } = require('pg')
const config = require('../config.private');
const pool = new Pool(config.db);

module.exports.execQuery = function(query, client) {
  console.log('Entro aca', query.text);
  client = (client instanceof Client) ? client : pool;
  return client.query(query.text, query.values);
}

module.exports.beginTransaction = function() {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);

      client.query('BEGIN', (err) => {
        if (err) reject(err);
        resolve({client, done});
      })
    });
  });
}

module.exports.commit = function(client) {
  return new Promise(function(resolve, reject) {
    client.query('COMMIT', (err) => {
      if (err) console.error('Error committing transaction', err)
      resolve();
    });
  });
}

module.exports.rollback = function(client) {
  return new Promise(function(resolve, reject) {
    client.query('ROLLBACK', (err) => {
      if (err) {
        console.error('Error rolling back', err);
        reject(err);
      }
      resolve();
    });
  });
}
