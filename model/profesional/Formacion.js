const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Institucion = require('../Institucion');
const Opcion = require('../Opcion');


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
      dataType: 'int',
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
      table: 'opcion',
      columns: [ 'tipo' ],
      refColumns: [ 'id' ]
    },
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
  ).returning(table.id).toQuery();

  return connector.execQuery(query, client)
         .then(r => {
           formacion.id = r.rows[0].id;
           return formacion;
         })
}

module.exports.addFormacion = addFormacion;


module.exports.getAll = function(id_profesional) {
  let query = table.select(
    table.id, table.titulo, table.tipo,
    table.fecha, Institucion.table.nombre.as('institucion'),
    Opcion.table.valor.as('tipoFormacion')
  )
  .from(
     table.join(Institucion.table).on(table.institucion.equals(Institucion.table.id))
          .join(Opcion.table).on(table.tipo.equals(Opcion.table.id))
  ).where(table.profesional.equals(id_profesional))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}
