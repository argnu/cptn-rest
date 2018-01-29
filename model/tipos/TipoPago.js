const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_pago',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'descripcion',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'cuentaContable',
      dataType: 'varchar(10)'
    },
    {
      name: 'habilitado',
      dataType: 'boolean'
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);
  if (params.sort && params.sort.valor) query.order(table.descripcion[params.sort.valor]);

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
