const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
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

module.exports.table = table;
