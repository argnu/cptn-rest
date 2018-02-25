const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'matricula_historial',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'matricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'documento',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'usuario',
      dataType: 'varchar(45)',
      notNull: true
    }
  ],

  foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']          
      },
      {
        table: 't_estadomatricula',
        columns: ['estado'],
        refColumns: ['id']          
      },
      {
        table: 'documento',
        columns: ['documento'],
        refColumns: ['id']          
      },
      {
        table: 'usuario',
        columns: ['usuario'],
        refColumns: ['id']          
      }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.id.equals(id))
       .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.matricula.value(data.matricula),
    table.estado.value(data.estado),
    table.documento.value(data.documento),
    table.fecha.value(data.fecha),
    table.usuario.value(data.usuario)
  )
  .returning(table.id, table.estado, table.documento, table.fecha, table.usuario)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
}