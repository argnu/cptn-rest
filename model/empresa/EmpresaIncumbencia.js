const dot = require('dot-object');
const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const TipoIncumbencia = require('../tipos/TipoIncumbencia');

const table = sql.define({
  name: 'empresa_incumbencia',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'empresa',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'incumbencia',
      dataType: 'int',
      notNull: true
    },
    
  ],

  foreignKeys: [
    {
      table: 'empresa',
      columns: [ 'empresa' ],
      refColumns: [ 'id' ],
      onDelete: 'CASCADE'
    },
    {
      table: 't_incumbencia',
      columns: [ 'incumbencia' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.empresa,
  TipoIncumbencia.table.id.as('incumbencia.id'),
  TipoIncumbencia.table.valor.as('incumbencia.valor')  
]

const from = table.join(TipoIncumbencia.table).on(table.incumbencia.equals(TipoIncumbencia.table.id));

module.exports.getByEmpresa = function(id_empresa) {
  let query = table.select(select)
  .from(from)
  .where(table.empresa.equals(id_empresa))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.empresa.value(data.empresa),
    table.incumbencia.value(data.incumbencia)
  )
  .returning(table.id, table.empresa, table.incumbencia)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);  
}

module.exports.delete = function (id, client) {
  let query = table.delete()
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query, client);
}