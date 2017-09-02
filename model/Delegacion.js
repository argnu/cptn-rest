const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
  name: 'delegacion',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});
