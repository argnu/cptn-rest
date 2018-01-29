const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'delegacion',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'domicilio',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'domicilio',
      columns: [ 'domicilio' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function() {
  let query = table.select(
    table.id, table.nombre
  ).from(
    table
  ).toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(
    table.id, table.nombre
  ).from(
    table
  ).where(table.id.equals(id))
  .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}
