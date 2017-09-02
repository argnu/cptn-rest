const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Institucion = require('../Institucion').table;


const table = sql.define({
  name: 'formacion',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'titulo',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'tipo',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'institucion',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'institucion',
      columns: [ 'institucion' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ]
    }
  ]

});

module.exports.table = table;

function addFormacion(client, formacion) {
  let query = table.insert(
    table.titulo.value(formacion.titulo), table.tipo.value(formacion.tipo),
    table.fecha.value(formacion.fecha), table.institucion.value(formacion.institucion),
    table.profesional.value(formacion.profesional)
  ).toQuery()

  return connector.execQuery(query, client);
}

module.exports.addFormacion = addFormacion;

module.exports.add = function(formacion) {
  return addFormacion(pool, formacion);
}

module.exports.getAll = function(id) {
  let query = table.select(
      table.titulo, table.tipo,
      table.fecha, Institucion.nombre.as('institucion')
    ).from(table.join(Institucion).on(table.institucion.equals(Institucion.id)))
     .where(table.profesional.equals(id))
     .toQuery();

  return connector.execQuery(query);
}
