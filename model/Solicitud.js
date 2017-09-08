const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Profesional = require('./profesional/Profesional');
const Empresa = require('./Empresa');
const Entidad = require('./Entidad');

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
    },
    {
      name: 'tipoEntidad',
      dataType: 'varchar(20)'
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

function addSolicitud(client, solicitud) {
  let query = table.insert(
    table.fecha.value(solicitud.fecha),
    table.estado.value('pendiente'),
    table.delegacion.value(solicitud.delegacion),
    table.entidad.value(solicitud.entidad.id),
    table.tipoEntidad.value(solicitud.tipoEntidad)
  ).returning(table.id, table.fecha, table.estado, table.delegacion, table.tipoEntidad).toQuery()
  return connector.execQuery(query, client)
         .then(r => {
           let solicitud_added = r.rows[0];
           return solicitud_added;
         })
}

module.exports.add = function(solicitud) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {

        if (solicitud.tipoEntidad == 'profesional') {
          Profesional.addProfesional(connection.client, solicitud.entidad)
            .then(profesional_added => {
              solicitud.entidad = profesional_added;
              return addSolicitud(connection.client, solicitud)
                .then(solicitud_added => {
                  return connector
                  .commit(connection.client)
                  .then(r => {
                    connection.done();
                    solicitud_added.entidad = profesional_added;
                    resolve(solicitud_added);
                  });
                })
            })
            .catch(e => {
              connector.rollback(connection.client);
              connection.done();
              reject(e);
            });
        }
        else if (solicitud.tipoEntidad == 'empresa') {
          Empresa.addEmpresa(connection.client, solicitud.entidad)
            .then(empresa_added => {
              solicitud.entidad = empresa_added;
              return addSolicitud(connection.client, solicitud)
                .then(solicitud_added => {
                  return connector
                  .commit(connection.client)
                  .then(r => {
                    connection.done();
                    solicitud_added.entidad = empresa_added;
                    resolve(solicitud_added);
                  });
                })
            })
            .catch(e => {
              connector.rollback(connection.client);
              connection.done();
              reject(e);
            });
        }
      })
    });
}

module.exports.getAll = function(params) {
  return new Promise(function(resolve, reject) {
    let solicitudes = [];
    let query = table.select(
      table.star()
    ).from(
      table.join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
           .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
           .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
    );

    /* ----------------- FILTERS  ---------------- */
    if (params.tipoEntidad) query.where(table.tipoEntidad.equals(params.tipoEntidad));
    if (params.estado) query.where(table.estado.equals(params.estado));
    if (params.cuit) query.where(Entidad.table.cuit.like(`%${params.cuit}%`));
    if (params.nombreEmpresa) query.where(Empresa.table.nombre.like(`%${params.nombreEmpresa}%`));
    if (params.dni) query.where(Profesional.table.dni.like(`%${params.dni}%`));
    if (params.apellido) query.where(Profesional.table.apellido.like(`%${params.apellido}%`));

    /* ---------------- SORTING ------------------ */
    if (params.sort && params.sort.estado) query.order(table.valor[params.estado.valor]);
    

    /* ---------------- LIMIT AND OFFSET ------------------ */
    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);


    connector.execQuery(query.toQuery())
    .then(r => {
      solicitudes = r.rows;
      let proms = solicitudes.map(s => {
        if (s.tipoEntidad == 'profesional') return Profesional.get(s.entidad)
        else if (s.tipoEntidad == 'empresa') return Empresa.get(s.entidad);
      });

      Promise.all(proms)
             .then(rs => {
               rs.forEach((r, i) => {
                 solicitudes[i].entidad = r;
               });
               resolve(solicitudes);
             })
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  let solicitud = {};
  let query = table.select(table.star())
                   .from(table)
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

module.exports.setEstado = function(client, id, estado) {
  let query = table.update({
                      estado: estado
                   })
                   .from(table)
                   .where(table.id.equals(id))
                   .toQuery();
  return connector.execQuery(query, client);
}
