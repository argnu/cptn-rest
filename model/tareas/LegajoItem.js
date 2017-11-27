const sql = require('sql');
sql.setDialect('postgres');

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
