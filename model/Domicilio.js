const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
  name: 'domicilio',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'calle',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'localidad',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
    table: 'localidad',
    columns: [ 'localidad' ],
    refColumns: [ 'id' ]
  }
});
