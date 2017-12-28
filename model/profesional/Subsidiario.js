const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'subsidiario',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'dni',
      dataType: 'varchar(20)',
      notNull: true
    },
    {
      name: 'apellido',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'porcentaje',
      dataType: 'float',
      notNull: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;


function addSubsidiario(subsidiario, client) {
  let query = table.insert(
    table.dni.value(subsidiario.dni), table.nombre.value(subsidiario.nombre),
    table.apellido.value(subsidiario.apellido), table.porcentaje.value(subsidiario.porcentaje),
    table.profesional.value(subsidiario.profesional)
  ).returning(table.id).toQuery();

  return connector.execQuery(query, client)
         .then(r => {
           subsidiario.id = r.rows[0].id;
           return subsidiario;
         })
}

module.exports.addSubsidiario = addSubsidiario;

module.exports.getAll = function(id_profesional) {
  let query = table.select(
      table.id, table.nombre, table.apellido,
      table.dni, table.porcentaje
  )
  .from(table)
  .where(table.profesional.equals(id_profesional))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}