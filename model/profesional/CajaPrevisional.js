const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 'caja_previsional',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
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

module.exports.add = function(caja, client) {
    let query = table.insert(
        table.nombre.value(caja.nombre)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}
