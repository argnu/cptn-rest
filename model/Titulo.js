const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');
const TipoFormacion = require('./tipos/TipoFormacion');

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

module.exports.getAll = function(params) {
  let query = table.select(
    table.id, table.nombre, table.libro,
    TipoFormacion.table.valor.as('tipo')
  ).from(
    table.join(TipoFormacion.table).on(table.tipo.equals(TipoFormacion.table.id))
  )

  if (params.tipo && !isNaN(+params.tipo)) query.where(table.tipo.equals(params.tipo))

  return connector.execQuery(query.toQuery())
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
