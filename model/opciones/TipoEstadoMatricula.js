const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_estadoMatricula',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});
