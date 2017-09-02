const connector = require('../connector');
const _ = require('lodash');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'opcion',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let opciones = [];
    connector.execQuery(table.select(table.star()).from(table).toQuery())
    .then(r => {
      opciones = _.groupBy(r.rows, (e) => e.tipo);
      resolve(opciones);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = table.select(table.star())
         .from(table)
         .where(table.id.equals(id))
         .toQuery();
    connector.execQuery(query)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
