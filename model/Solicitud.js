const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Profesional = require('./profesional/Profesional');
const Empresa = require('./Empresa');
const Entidad = require('./Entidad');
const Delegacion = require('./Delegacion');

const table = sql.define({
  name: 'solicitud',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'exencionArt10',
      dataType: 'boolean',
      notNull: true,
      defaultValue: false
    },
    {
      name: 'exencionArt6',
      dataType: 'boolean',
      notNull: true,
      defaultValue: false
    },
    {
      name: 'delegacion',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'entidad',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'delegacion',
      columns: [ 'delegacion' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'entidad',
      columns: [ 'entidad' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

function addSolicitud(solicitud, client) {
  let query = table.insert(
    table.fecha.value(solicitud.fecha),
    table.estado.value('pendiente'),
    table.delegacion.value(solicitud.delegacion),
    table.entidad.value(solicitud.entidad.id)
  ).returning(table.id, table.fecha, table.estado, table.delegacion, table.entidad).toQuery()
  return connector.execQuery(query, client)
         .then(r => {
           let solicitud_added = r.rows[0];
           return solicitud_added;
         })
}

module.exports.add = function(solicitud) {
    return connector
    .beginTransaction()
    .then(connection => {

        if (solicitud.entidad.tipo == 'profesional') {
          return Profesional.addProfesional(connection.client, solicitud.entidad)
            .then(profesional_added => {
              solicitud.entidad = profesional_added;
              return addSolicitud(solicitud, connection.client)
                .then(solicitud_added => {
                  return connector
                  .commit(connection.client)
                  .then(r => {
                    connection.done();
                    solicitud_added.entidad = profesional_added;
                    return solicitud_added;
                  });
                })
            })
            .catch(e => {
              connector.rollback(connection.client);
              connection.done();
              throw e;
            });
        }
        else if (solicitud.entidad.tipo == 'empresa') {
          return Empresa.addEmpresa(connection.client, solicitud.entidad)
            .then(empresa_added => {
              solicitud.entidad = empresa_added;
              return addSolicitud(solicitud, connection.client)
                .then(solicitud_added => {
                  return connector
                  .commit(connection.client)
                  .then(r => {
                    connection.done();
                    solicitud_added.entidad = empresa_added;
                    return solicitud_added;
                  });
                })
            })
            .catch(e => {
              connector.rollback(connection.client);
              connection.done();
              throw e;
            });
        }
      });
}

const select = {
  atributes: [
    table.star(), Delegacion.table.nombre.as('delegacion'),
    Entidad.table.tipo.as('tipoEntidad')
  ],
  from: table.join(Delegacion.table).on(table.delegacion.equals(Delegacion.table.id))
             .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
             .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
             .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
}

module.exports.getAll = function(params) {
    let solicitudes = [];
    let query = table.select(...select.atributes).from(select.from);

    /* ----------------- FILTERS  ---------------- */
    if (params.tipoEntidad) query.where(Entidad.table.tipo.equals(params.tipoEntidad));
    if (params.estado) query.where(table.estado.equals(params.estado));
    if (params.exencionArt10) query.where(table.exencionArt10.equals(params.exencionArt10));

    if (params.cuit) query.where(Entidad.table.cuit.like(`%${params.cuit}%`));
    if (params.nombreEmpresa) query.where(Empresa.table.nombre.like(`%${params.nombreEmpresa}%`));
    if (params.dni) query.where(Profesional.table.dni.like(`%${params.dni}%`));
    if (params.apellido) query.where(Profesional.table.apellido.like(`%${params.apellido}%`));

    /* ---------------- SORTING ------------------ */
    if (params.sort && params.sort.estado) query.order(table.valor[params.estado.valor]);


    /* ---------------- LIMIT AND OFFSET ------------------ */
    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);


    return connector.execQuery(query.toQuery())
    .then(r => {
      solicitudes = r.rows;
      let proms = solicitudes.map(s => {
        if (s.tipoEntidad == 'profesional') return Profesional.get(s.entidad)
        else if (s.tipoEntidad == 'empresa') return Empresa.get(s.entidad);
      });

      return Promise.all(proms)
             .then(rs => {
               rs.forEach((r, i) => {
                 solicitudes[i].entidad = r;
                 delete(solicitudes[i].tipoEntidad);
               });
               return solicitudes;
             })
    });
}

module.exports.get = function(id) {
  let solicitud = {};
  let query = table.select(...select.atributes)
                   .from(select.from)
                   .where(table.id.equals(id))
                   .toQuery();

  return connector.execQuery(query)
  .then(r => {
    solicitud = r.rows[0];
    if (solicitud.tipoEntidad == 'profesional') return Profesional.get(solicitud.entidad)
    else if (solicitud.tipoEntidad == 'empresa') return Empresa.get(solicitud.entidad);
  })
  .then(r => {
    solicitud.entidad = r;
    return solicitud;
  });
}

module.exports.setEstado = function(id, estado, client) {
  let query = table.update({
                      estado: estado
                   })
                   .where(table.id.equals(id))
                   .toQuery();
  return connector.execQuery(query, client);
}
