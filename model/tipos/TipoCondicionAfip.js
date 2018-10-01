const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_condicionafip',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 't_entidad',
      dataType: 'varchar(45)'
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);
  query.order(table.valor.asc);

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
