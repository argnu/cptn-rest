const connector = require('../../connector');
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
      dataType: 'varchar(20)',
      notNull: true
    },
    {
      name: 'moneda',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'pago',
      dataType: 'int',
      notNull: true
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
  ],

  foreignKeys: [
    {
      table: 't_moneda',
      columns: [ 'moneda' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_pago',
      columns: [ 'pago' ],
      refColumns: [ 'id' ]
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