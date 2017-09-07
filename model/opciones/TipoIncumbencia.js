const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_incumbencia',
  columns: [{
      name: 'id',
      dataType: 'int',
      primaryKey: true
    },
    {
      name: 'valor',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'acreditacomo',
      dataType: 'int'
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