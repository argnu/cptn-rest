const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Solicitud = require('./Solicitud');
const Profesional = require('./profesional/Profesional');
const Empresa = require('./Empresa');
const Entidad = require('./Entidad');
const TipoEstadoMatricula = require('./tipos/TipoEstadoMatricula');
const errors = require('../errors');

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
      dataType: 'int',
      notNull: true
    },
    {
      name: 'solicitud',
      dataType: 'int'
    },
    {
      name: 'fechaResolucion',
      dataType: 'date'
    },
    {
      name: 'numeroActa',
      dataType: 'varchar(50)'
    },
    {
      name: 'fechaBaja',
      dataType: 'date'
    },
    {
      name: 'observaciones',
      dataType: 'text'
    },
    {
      name: 'notasPrivadas',
      dataType: 'text'
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
      dataType: 'int',
      notNull: true
    },
    {
      name: 'idMigracion',
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

function addMatriculaMigracion(matricula, client) {
  let query = table.insert(
    table.legajo.value(matricula.legajo),
    table.idMigracion.value(matricula.idMigracion),
    table.entidad.value(matricula.entidad),
    table.solicitud.value(matricula.solicitud),
    table.fechaResolucion.value(matricula.fechaResolucion),
    table.numeroActa.value(matricula.numeroActa),
    table.numeroMatricula.value(matricula.numeroMatricula),
    table.fechaBaja.value(matricula.fechaBaja),
    table.observaciones.value(matricula.observaciones),
    table.notasPrivadas.value(matricula.notasPrivadas),
    table.asientoBajaF.value(matricula.asientoBajaF),
    table.codBajaF.value(matricula.codBajaF),
    table.nombreArchivoFoto.value(matricula.nombreArchivoFoto),
    table.nombreArchivoFirma.value(matricula.nombreArchivoFirma),
    table.estado.value(matricula.estado)
  ).returning(table.id).toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

module.exports.addMatriculaMigracion = addMatriculaMigracion;


function addMatricula(matricula, client) {
  let query = table.insert(
    table.entidad.value(matricula.entidad),
    table.solicitud.value(matricula.solicitud),
    table.fechaResolucion.value(matricula.fechaResolucion),
    table.numeroActa.value(matricula.numeroActa),
    table.estado.value(matricula.estado)
  ).returning(table.id, table.entidad,
    table.solicitud, table.fechaResolucion, table.numeroActa).toQuery()

  return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}

function getEstadoHabilitada() {
  let query = TipoEstadoMatricula.table.select(
    TipoEstadoMatricula.table.id
  ).where(TipoEstadoMatricula.table.valor.equals("Habilitado"))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

function existMatricula(solicitud) {
  let query = table.select(
    table.id
  ).where(table.solicitud.equals(solicitud))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.length != 0);
}

module.exports.add = function(matricula) {
  return existMatricula(matricula.solicitud)
  .then(exist => {
      if (!exist) {
        return Promise.all([
          Solicitud.get(matricula.solicitud),
          getEstadoHabilitada()
        ])
        .then(([solicitud, estado]) => {
          return connector
          .beginTransaction()
          .then(connection => {
              let matricula_added;
              matricula.entidad = solicitud.entidad.id;
              matricula.estado = estado.id;
              return Solicitud.setEstado(matricula.solicitud, 'aprobada', connection.client)
              .then(r => addMatricula(matricula, connection.client))
              .then(r => {
                matricula_added = r;
                connector.commit(connection.client)
              })
              .then(r => {
                connection.done();
                return matricula_added;
              })
              .catch(e => {
                connector.rollback(connection.client);
                connection.done();
                throw e;
              });
          })
        });
      }
      else throw new errors.CustomError(400, "Ya existe una matrícula para dicha solicitud");
  })
}

const select = {
  atributes: [
    table.id, table.legajo, table.numeroMatricula,
    TipoEstadoMatricula.table.valor.as('estado'),
    table.fechaResolucion, table.numeroActa,
    table.entidad, table.solicitud,
    table.fechaBaja, table.observaciones,
    table.notasPrivadas, table.asientoBajaF,
    table.codBajaF, table.nombreArchivoFoto,
    table.nombreArchivoFirma,
    Entidad.table.tipo.as('tipoEntidad')
  ],

  from: table.join(TipoEstadoMatricula.table).on(table.estado.equals(TipoEstadoMatricula.table.id))
             .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
             .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
             .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
};


function getTotal(params) {
  let query;
  if (!params) {
    query = table.select(table.count().as('total')).from(table);
  }
  else {
    query = table.select(
      table.count(table.id).as('total')
    ).from(select.from);

    if (params.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.numeroMatricula}%`));
    if (params.estado && !isNaN(+params.estado)) query.where(table.estado.equals(params.estado));
    if (params.tipoEntidad) query.where(Entidad.table.tipo.equals(params.tipoEntidad));
    if (params.apellido) query.where(Profesional.table.apellido.ilike(`%${params.apellido}%`));
    if (params.dni) query.where(Profesional.table.dni.ilike(`%${params.dni}%`));
    if (params.nombreEmpresa) query.where(Empresa.table.nombre.ilike(`%${params.nombreEmpresa}%`));
    if (params.cuit) query.where(Profesional.table.cuit.ilike(`%${params.cuit}%`));
  }

  return connector.execQuery(query.toQuery())
  .then(r => +r.rows[0].total);
}


module.exports.getAll = function (params) {
  let matriculas = [];
  let query = table.select(
    ...select.atributes
  ).from(select.from);

  if (params.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.numeroMatricula}%`));
  if (params.estado && !isNaN(+params.estado)) query.where(table.estado.equals(params.estado));
  if (params.tipoEntidad) query.where(Entidad.table.tipo.equals(params.tipoEntidad));
  if (params.apellido) query.where(Profesional.table.apellido.ilike(`%${params.apellido}%`));
  if (params.dni) query.where(Profesional.table.dni.ilike(`%${params.dni}%`));
  if (params.nombreEmpresa) query.where(Empresa.table.nombre.ilike(`%${params.nombreEmpresa}%`));
  if (params.cuit) query.where(Profesional.table.cuit.ilike(`%${params.cuit}%`));

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

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
            delete(matriculas[i].tipoEntidad);
          });
          return Promise.all([
                  getTotal(params),
                  getTotal()
                ]).then(([totalQuery, total]) => ({ total, totalQuery, resultados: matriculas }))
        })
    })
}

module.exports.get = function (id) {
  let solicitud = {};
  let query = table.select(...select.atributes)
                    .from(select.from)
                    .where(table.id.equals(id))
                    .toQuery();

  return connector.execQuery(query)
    .then(r => {
      matricula = r.rows[0];
      if (!matricula) throw new errors.CustomError(404, "No existe el recurso solicitado");
      if (matricula.tipoEntidad == 'profesional') return Profesional.get(matricula.entidad)
      else if (matricula.tipoEntidad == 'empresa') return Empresa.get(matricula.entidad);
    })
    .then(r => {
      matricula.entidad = r;
      delete(matricula.tipoEntidad);
      return matricula;
    })
}

module.exports.getMigracion = function (id, empresa) {
  let solicitud = {};
  let query = table.select(table.star())
    .from(table.join(Entidad.table).on(table.entidad.equals(Entidad.table.id)))
    .where(
      table.idMigracion.equals(id)
      .and(Entidad.table.tipo.equals(empresa ? 'empresa' : 'profesional'))
    )
    .toQuery();
  return connector.execQuery(query)
    .then(r => r.rows[0]);
}
