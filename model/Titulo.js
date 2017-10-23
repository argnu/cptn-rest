const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'titulo',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'libro',
      dataType: 'VARCHAR(10)',
    },
    {
      name: 'tipo',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'idMigracion',
      dataType: 'int'
    }
  ],

  foreignKeys: {
    table: 't_formacion',
    columns: ['tipo'],
    refColumns: ['id']
  }
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
