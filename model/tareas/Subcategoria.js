const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
  name: 'tarea_subcategoria',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'descripcion',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'categoria',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
      table: 'tarea_categoria',
      columns: ['categoria'],
      refColumns: ['id']
    }
});
