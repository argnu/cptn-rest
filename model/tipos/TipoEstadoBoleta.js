const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 't_estadoboleta',
  columns: [{
      name: 'id',
      dataType: 'serial',
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

module.exports.getAll = function (params) {
  let query = table.select(table.star()).from(table);
  if (params.sort && params.sort.valor) query.order(table.valor[params.sort.valor]);

  return connector.execQuery(query.toQuery())
    .then(r => r.rows);
}

module.exports.get = function (id) {
  let query = table.select(table.star())
    .from(table)
    .where(table.id.equals(id))
    .toQuery();
  return connector.execQuery(query)
    .then(r => r.rows[0]);
}

module.exports.add = function(estado) {
  let query = table.insert(
    table.valor.value(estado)
  )
  .returning(table.id, table.valor)
  .toQuery();

  return connector.execQuery(query).then(r => r.rows[0]);
}