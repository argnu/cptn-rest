const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_moneda',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'abreviatura',
      dataType: 'varchar(5)',
      notNull: true
    },
    {
      name: 'cambio',
      dataType: 'float'
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);
  if (params.sort && params.sort.valor) query.order(table.valor[params.sort.valor]);

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
