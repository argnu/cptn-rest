const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'empresa_incumbencia',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'idEmpresa',
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
      table: 'empresa',
      columns: [ 'idEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_incumbencia',
      columns: [ 'incumbencia' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;
