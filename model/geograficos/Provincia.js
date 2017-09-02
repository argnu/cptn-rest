const connector = require('../../connector');
const utils = require('../../utils');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'provincia',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)'
    },
    {
      name: 'pais',
      dataType: 'int'
    }
  ],

  foreignKeys: {
      table: 'pais',
      columns: [ 'pais' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

module.exports.getAll = function(url_query) {
  let query = table.select(table.star()).from(table);
  if (url_query.pais)
    query.where(table.pais.equals(url_query.pais))

  return new Promise(function(resolve, reject) {
    connector.execQuery(query.toQuery())
    .then(r => {
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = table.select(table.star()).from(table).toQuery();
    connector.execQuery(query)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
