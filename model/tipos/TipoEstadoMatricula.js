const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_estadomatricula',
  columns: [{
      name: 'id',
      dataType: 'int',
      primaryKey: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});

module.exports.table = table;
