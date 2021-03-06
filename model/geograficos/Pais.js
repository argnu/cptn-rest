const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const table = sql.define({
  name: 'pais',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let query = table.select(table.star()).from(table).toQuery();
    connector.execQuery(query)
    .then(r => {
      resolve(r.rows);
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
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}
