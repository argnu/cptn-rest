const dot = require('dot-object');
const connector = require(`../db/connector`);
const sql = require('node-sql-2');
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
  table.titulo,
  TipoIncumbencia.table.id.as('incumbencia.id'),
  TipoIncumbencia.table.valor.as('incumbencia.valor')  
]

const from = table.join(TipoIncumbencia.table).on(table.incumbencia.equals(TipoIncumbencia.table.id));

module.exports.getByTitulo = function(id_titulo) {
  let query = table.select(select)
  .from(from)
  .where(table.titulo.equals(id_titulo))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.map(row => dot.object(row)));
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

module.exports.delete = function (id, client) {
  let query = table.delete()
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query, client);
}