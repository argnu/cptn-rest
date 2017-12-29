const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const TipoIncumbencia = require('./tipos/TipoIncumbencia');

const table = sql.define({
  name: 'empresa_incumbencia',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'idEmpresa',
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
      columns: [ 'idEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_incumbencia',
      columns: [ 'incumbencia' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

module.exports.getAll = function(id_empresa) {
  let query = table.select(
    TipoIncumbencia.table.id,
    TipoIncumbencia.table.valor
  )
  .from(table.join(TipoIncumbencia.table).on(table.incumbencia.equals(TipoIncumbencia.table.id)))
  .where(table.idEmpresa.equals(id_empresa))
  .toQuery();

  return connector.execQuery(query)
        .then(r => r.rows);
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.idEmpresa.value(data.idEmpresa),
    table.incumbencia.value(data.incumbencia)
  )
  .returning(table.id, table.idEmpresa, table.incumbencia)
  .toQuery();

  return connector.execQuery(query, client)
        .then(r => r.rows[0]);  
}

module.exports.delete = function (empresa, incumbencia, client) {
  let query = table.delete()
  .where(table.incumbencia.equals(incumbencia).and(table.idEmpresa.equals(empresa)))
  .toQuery();
  return connector.execQuery(query, client);
}