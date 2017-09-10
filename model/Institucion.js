const sql = require('sql');
sql.setDialect('postgres');

module.exports.table = sql.define({
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

function addInstitucion(client, institucion) {
  if (institucion && institucion.nombre) {
    let query = table.insert(
      table.nombre.value(domicilio.nombre)
    ).returning(table.id, table.nombre).toQuery();
    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
  }
  else Promise.resolve(null);
}

