const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const Item = require('./Item');

const table = sql.define({
  name: 'legajo_item',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
        name: 'legajo',
        dataType: 'int',
        primaryKey: true
      },
    {
      name: 'item',
      dataType: 'int',
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
    }
  ],

  foreignKeys: {
      table: 'legajo',
      columns: [ 'legajo' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

function getIdItem(item, client) {
  if (typeof item == "number") return Promise.resolve(item);
  return Item.add(item, client).then(item_nuevo => item_nuevo.id);
}

module.exports.add = function(item, client) {
  return getIdItem(item.item, client)
  .then(id_item => {
    let query = table.insert(
        table.legajo.value(item.legajo),
        table.item.value(id_item),
        table.valor.value(item.valor)
    )
    .returning(table.id, table.legajo, table.item, table.valor)
    .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
  })
}
