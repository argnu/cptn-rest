const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
  name: 'condafip',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'condicion',
      dataType: 'varchar(100)',
      notNull: true
    }
  ]
});
