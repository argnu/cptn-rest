const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'institucion',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    }
  ]
});

module.exports.add = function(institucion, client) {
  if (institucion && institucion.nombre) {
    let query = table.insert(
      table.nombre.value(domicilio.nombre)
    )
    .returning(table.star())
    .toQuery();
    
    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
  }
  else Promise.resolve();
}

module.exports.table = table;

module.exports.getAll = function() {
  let query = table.select(
    table.id, table.nombre
  ).from(
    table
  ).toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(
    table.id, table.nombre
  ).from(
    table
  ).where(table.id.equals(id))
  .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}
