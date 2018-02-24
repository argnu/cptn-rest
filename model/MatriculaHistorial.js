const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'matricula_historial',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'matricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'usuario',
      dataType: 'varchar(45)',
      notNull: true
    }
  ],

  foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']          
      },
      {
        table: 't_estadomatricula',
        columns: ['estado'],
        refColumns: ['id']          
      },
      {
        table: 'usuario',
        columns: ['usuario'],
        refColumns: ['id']          
      }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.id.equals(id))
       .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}
