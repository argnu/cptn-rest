const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const Item = require('./Item');

const table = sql.define({
  name: 'tarea_item_predet',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'subcategoria',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'item',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'tarea_subcategoria',
      columns: [ 'subcategoria' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'tarea_item',
      columns: [ 'item' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

module.exports.get = function(params) {
  let query = table.select(
    Item.table.id, Item.table.descripcion, table.subcategoria
  ).from(
    table.join(Item.table).on(table.item.equals(Item.table.id))
  );

  if (params.subcategoria) query.where(table.subcategoria.equals(params.subcategoria));

  return connector.execQuery(query.toQuery())
         .then(r => r.rows);
}
