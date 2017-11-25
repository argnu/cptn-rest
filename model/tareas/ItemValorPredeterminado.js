const sql = require('sql');
sql.setDialect('postgres');

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
