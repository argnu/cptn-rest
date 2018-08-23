const connector = require('../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'documento',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'varchar(10)',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    }
  ],

  foreignKeys: [
      {
        table: 't_documento',
        columns: ['tipo'],
        refColumns: ['id']          
      }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);

  if (params.numero) query.where(table.numero.equals(params.numero));
  if (params.tipo) query.where(table.tipo.equals(params.tipo));
  if (params.fecha) query.where(table.fecha.equals(params.fecha));

  if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);

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

module.exports.add = function(documento, client) {
  try { 
    let query = table.insert(
      table.numero.value(documento.numero),
      table.fecha.value(documento.fecha),
      table.tipo.value(documento.tipo)
    )
    .returning(table.id, table.numero, table.tipo, table.fecha)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
  }
  catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}
