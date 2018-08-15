const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_formapago',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'cuenta',
      dataType: 'varchar(20)'
    },
    {
      name: 'moneda',
      dataType: 'int'
    },
    {
      name: 'pago',
      dataType: 'int'
    },
    {
      name: 'senia',
      dataType: 'boolean'
    },
    {
      name: 'mutual',
      dataType: 'boolean'
    },
    {
      name: 'compensacion',
      dataType: 'boolean'
    },
    {
      name: 'validoNCredito',
      dataType: 'boolean'
    },
    {
      name: 'activo', 
      dataType: 'boolean',
      defaultValue: 'true'
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table).where(table.activo.equals(true));
  if (params.sort && params.sort.valor) query.order(table.nombre[params.sort.valor]);

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
