const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Institucion = require('../Institucion');
const TipoFormacion = require('../tipos/TipoFormacion');
const Titulo = require('../Titulo');

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
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date'
    },
    {
      name: 'institucion',
      dataType: 'int'
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
    },
    {
      table: 'titulo',
      columns: [ 'titulo' ],
      refColumns: [ 'id' ]
    }
  ]

});

module.exports.table = table;

function addFormacion(formacion, client) {
  let query = table.insert(
    table.titulo.value(formacion.titulo),
    table.fecha.value(formacion.fecha),
    table.institucion.value(formacion.institucion),
    table.profesional.value(formacion.profesional)
  ).returning(table.id, table.titulo, table.fecha, table.institucion, table.profesional).toQuery();

  return connector.execQuery(query, client)
         .then(r => r.rows[0]);
}

module.exports.addFormacion = addFormacion;


module.exports.getAll = function(id_profesional) {
  let query = table.select(
    table.id,
    Titulo.table.nombre.as('titulo'),
    Titulo.table.tipo.as('tipo'),
    table.fecha, Institucion.table.nombre.as('institucion'),
    TipoFormacion.table.valor.as('tipoFormacion')
  )
  .from(
     table.join(Institucion.table).on(table.institucion.equals(Institucion.table.id))
          .join(Titulo.table).on(table.titulo.equals(Titulo.table.id))
          .join(TipoFormacion.table).on(Titulo.table.tipo.equals(TipoFormacion.table.id))
  ).where(table.profesional.equals(id_profesional))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}
