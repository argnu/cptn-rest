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
      dataType: 'varchar(10)',
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

function addSubsidiario(client, subsidiario) {
  let query = table.insert(
    table.dni.value(subsidiario.dni), table.nombre.value(subsidiario.nombre),
    table.apellido.value(subsidiario.apellido), table.porcentaje.value(subsidiario.porcentaje),
    table.profesional.value(subsidiario.profesional)
  ).toQuery();

  return connector.execQuery(query, client);
}

module.exports.addSubsidiario = addSubsidiario;

module.exports.add = function(subsidiario) {
  return addSubsidiario(pool, subsidiario)
}

module.exports.getAll = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.profesional.equals(id))
       .toQuery();
  return connector.execQuery(query)
}
