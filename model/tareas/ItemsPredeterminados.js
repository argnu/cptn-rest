const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
  name: 'tarea_items_predet',
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
