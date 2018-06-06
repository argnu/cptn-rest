const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

 const table = sql.define({
  name: 't_variable_global',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
        name: 'nombre',
        dataType: 'varchar(45)',
    },
    {
        name: 'descripcion',
        dataType: 'varchar(255)',
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);
  if (params.sort && params.sort.nombre) query.order(table.valor[params.sort.nombre]);
  if (params.sort && params.sort.descripcion) query.order(table.valor[params.sort.descripcion]);

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

module.exports.add = function(id) {
    let query = table.insert(
        table.nombre.value(global.nombre),
        table.descripcion.value(global.descripcion)
    )
    .returning(table.id, table.fecha, table.nombre, table.descripcion, table.valor)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
}
