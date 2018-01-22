const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const Item = require('./Item');

const table = sql.define({
  name: 'tarea_item_valor_predet',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'item',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    }
  ],

  foreignKeys: {
      table: 'tarea_item',
      columns: [ 'item' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

module.exports.get = function(params) {
  let query = table.select(
    Item.table.id, Item.table.descripcion, table.valor
  ).from(table.join(Item.table).on(table.item.equals(Item.table.id)));

  if (params.item) query.where(table.item.equals(params.item));

  return connector.execQuery(query.toQuery())
         .then(r => r.rows);
}
