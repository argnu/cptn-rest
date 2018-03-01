const connector = require(`../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const TipoIncumbencia = require(`./tipos/TipoIncumbencia`);

const table = sql.define({
  name: 'titulo_incumbencia',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'titulo',
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
      table: 'institucion_titulo',
      columns: [ 'titulo' ],
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

module.exports.getAll = function(id_titulo) {
  let query = table.select(
    TipoIncumbencia.table.id,
    TipoIncumbencia.table.valor
  )
  .from(table.join(TipoIncumbencia.table).on(table.incumbencia.equals(TipoIncumbencia.table.id)))
  .where(table.titulo.equals(id_titulo))
  .toQuery();

  return connector.execQuery(query)
        .then(r => r.rows);
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.titulo.value(data.titulo),
    table.incumbencia.value(data.incumbencia)
  )
  .returning(table.id, table.titulo, table.incumbencia)
  .toQuery();

  return connector.execQuery(query, client)
        .then(r => r.rows[0]);  
}

module.exports.delete = function (titulo, incumbencia, client) {
  let query = table.delete()
  .where(table.incumbencia.equals(incumbencia).and(table.titulo.equals(titulo)))
  .toQuery();
  return connector.execQuery(query, client);
}