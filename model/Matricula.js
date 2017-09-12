const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Solicitud = require('./Solicitud');
const TipoEstadoMatricula = require('./tipos/TipoEstadoMatricula');

const table = sql.define({
  name: 'matricula',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'legajo',
      dataType: 'int',
    },
    {
      name: 'numeroMatricula',
      dataType: 'varchar(20)'
    },
    {
      name: 'entidad',
      dataType: 'int'
    },
    {
      name: 'tipoEntidad',
      dataType: 'varchar(20)'
    },
    {
      name: 'solicitud',
      dataType: 'int'
    },
    {
      name: 'fechaResolucion',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'numeroActa',
      dataType: 'varchar(50)'
    },
    {
      name: 'fechaBaja',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'observaciones',
      dataType: 'varchar(255)'
    },
    {
      name: 'notasPrivadas',
      dataType: 'varchar(255)'
    },
    {
      name: 'asientoBajaF',
      dataType: 'varchar(2)'
    },
    {
      name: 'codBajaF',
      dataType: 'varchar(20)'
    },
    {
      name: 'nombreArchivoFoto',
      dataType: 'varchar(254)',
    },
    {
      name: 'nombreArchivoFirma',
      dataType: 'varchar(254)',
    },
    {
      name: 'estado',
      dataType: 'int'
    }
  ],

  foreignKeys: [{
      table: 'entidad',
      columns: ['entidad'],
      refColumns: ['id']
    },
    {
      table: 'solicitud',
      columns: ['solicitud'],
      refColumns: ['id']
    },
    {
      table: 't_estadomatricula',
      columns: ['estado'],
      refColumns: ['id']
    },
  ]
});

module.exports.table = table;

function addMatricula(matricula, client) {
  let query = table.insert(
    table.entidad.value(matricula.entidad.id),
    table.tipoEntidad.value(matricula.tipoEntidad),
    table.solicitud.value(matricula.solicitud),
    table.fechaResolucion.value(matricula.fechaResolucion),
    table.numeroActa.value(matricula.numeroActa),
    table.estado.value(matricula.estado)
  ).returning(table.id, table.tipoEntidad, table.entidad,
    table.solicitud, table.fechaResolucion, table.numeroActa).toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

function getEstadoHabilitada() {
  let query = TipoEstadoMatricula.table.select(
    TipoEstadoMatricula.table.id
  ).where(TipoEstadoMatricula.table.valor.equals('habilitado'))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.add = function(matricula) {
  return Promise.all([
    Solicitud.get(matricula.solicitud),
    getEstadoHabilitada()
  ])
  .then(([solicitud, estado]) => {
    matricula.entidad = solictiud.entidad.id;
    matricula.tipoEntidad = solicitud.tipoEntidad;
    matricula.estado = estado.id;
    return addMatricula(matricula);
  });
}

module.exports.getAll = function (params) {
  let matriculas = [];
  let query = table.select(table.star()).from(table);

  if (params.tipoEntidad) query.where(table.tipoEntidad.equals(params.tipoEntidad));

  return connector.execQuery(query.toQuery())
    .then(r => {
      matriculas = r.rows;
      let proms = matriculas.map(m => {
        if (m.tipoEntidad == 'profesional') return Profesional.get(m.entidad)
        else if (m.tipoEntidad == 'empresa') return Empresa.get(m.entidad);
      });

      return Promise.all(proms)
        .then(rs => {
          rs.forEach((r, i) => {
            matriculas[i].entidad = r;
          });
          return matriculas;
        })
    })
}

module.exports.get = function (id) {
  let solicitud = {};
  let query = table.select(table.star())
    .from(table)
    .where(table.id.equals(id))
    .toQuery();
  return connector.execQuery(query)
    .then(r => {
      matricula = r.rows[0];
      if (matricula.tipoEntidad == 'profesional') return Profesional.get(matricula.entidad)
      else if (matricula.tipoEntidad == 'empresa') return Empresa.get(matricula.entidad);
    })
    .then(r => {
      matricula.entidad = r;
      return matricula;
    })
}
