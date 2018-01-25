const connector = require('../db/connector');
const utils = require('../utils');
const sql = require('sql');
sql.setDialect('postgres');
const Profesional = require('./profesional/Profesional');
const Empresa = require('./empresa/Empresa');
const Entidad = require('./Entidad');
const Delegacion = require('./Delegacion');
const TipoEstadoSolicitud = require('./tipos/TipoEstadoSolicitud');

const table = sql.define({
  name: 'solicitud',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'numero',
      dataType: 'serial'
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'int',
      notNull: true
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
      name: 'created_by',
      dataType: 'varchar(45)',
    },
    {
      name: 'updated_by',
      dataType: 'varchar(45)',
    }     
  ],

  foreignKeys: [
    {
      table: 't_estadosolicitud',
      columns: [ 'estado' ],
      refColumns: [ 'id' ]
    },
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
    {
      table: 'usuario',
      columns: ['created_by'],
      refColumns: ['id']
    },
    {
      table: 'usuario',
      columns: ['updated_by'],
      refColumns: ['id']
    }     
  ]
});

module.exports.table = table;

function addSolicitud(solicitud, client) {
  let query = table.insert(
    table.created_by.value(solicitud.operador),
    table.updated_by.value(solicitud.operador),
    table.fecha.value(solicitud.fecha),
    table.estado.value(1),
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
  let connection;

  return connector
  .beginTransaction()
  .then(con => {
      connection = con;
      if (solicitud.entidad.tipo == 'profesional') {
        if (solicitud.entidad.id) {
          return Profesional.edit(solicitud.entidad.id, solicitud.entidad, connection.client)
          .then(r => Profesional.get(solicitud.entidad.id));
        }
        else {
          return Profesional.add(solicitud.entidad, connection.client);
        }
      }
      else if (solicitud.entidad.tipo == 'empresa') {
        return Empresa.add(solicitud.entidad, connection.client)
      }
  })
  .then(entidad_added => {
    solicitud.entidad = entidad_added;
    return addSolicitud(solicitud, connection.client)
      .then(solicitud_added => {
        return connector
        .commit(connection.client)
        .then(r => {
          connection.done();
          solicitud_added.entidad = entidad_added;
          return solicitud_added;
        });
      })
  })
  .catch(e => {
    connector.rollback(connection.client);
    connection.done();
    throw Error(e);
  });          
}

const select = {
  atributes: [
    table.id,
    table.fecha,
    table.numero,
    table.updated_by,
    table.created_by,
    table.entidad,
    TipoEstadoSolicitud.table.valor.as('estado'),
    Delegacion.table.nombre.as('delegacion'),
    Entidad.table.tipo.as('tipoEntidad')
  ],
  from: table.join(TipoEstadoSolicitud.table).on(table.estado.equals(TipoEstadoSolicitud.table.id))
             .join(Delegacion.table).on(table.delegacion.equals(Delegacion.table.id))
             .join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
             .leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
             .leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))
}

module.exports.getAll = function(params) {
    let solicitudes = [];
    let query = table.select(select.atributes).from(select.from);

    /* ----------------- FILTERS  ---------------- */
    if (params.tipoEntidad) query.where(Entidad.table.tipo.equals(params.tipoEntidad));
    if (params.estado) query.where(TipoEstadoSolicitud.table.valor.equals(params.estado));
    if (params.numero && !isNaN(+params.numero)) query.where(table.numero.equals(+params.numero));

    if (params.cuit) query.where(Entidad.table.cuit.like(`%${params.cuit}%`));
    if (params.nombreEmpresa) query.where(Empresa.table.nombre.ilike(`%${params.nombreEmpresa}%`));
    if (params.dni) query.where(Profesional.table.dni.like(`%${params.dni}%`));
    if (params.apellido) query.where(Profesional.table.apellido.ilike(`%${params.apellido}%`));

    /* ---------------- SORTING ------------------ */
    if (params.sort) {
      if (params.sort.numero) query.order(table.numero[params.sort.numero]);
      else if (params.sort.estado) query.order(table.estado[params.sort.estado]);
      else if (params.sort.nombreEmpresa) query.order(Empresa.table.nombre[params.sort.nombreEmpresa]);
      else if (params.sort.nombre) query.order(Profesional.table.nombre[params.sort.nombre]);
      else if (params.sort.apellido) query.order(Profesional.table.apellido[params.sort.apellido]);
      else if (params.sort.dni) query.order(Profesional.table.dni[params.sort.dni]);
      else if (params.sort.cuit) query.order(Entidad.table.cuit[params.sort.cuit]);   
    } 


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


module.exports.edit = function(id, solicitud) {
  return connector
    .beginTransaction()
    .then(connection => {
        let datos_solicitud = {
          fecha: solicitud.fecha,
          delegacion: solicitud.delegacion,
          updated_by: solicitud.operador
        }

        let query = table.update(datos_solicitud)
        .where(table.id.equals(id))
        .toQuery();
      
        return connector.execQuery(query, connection.client)
        .then(r => {
            if (solicitud.entidad.tipo == 'profesional') {
              return Profesional.edit(solicitud.entidad.id, solicitud.entidad, connection.client)
                .then(r => {
                    return connector.commit(connection.client)
                          .then(r => {
                            connection.done();
                            return id
                          });                  
                })
            }  
            else if (solicitud.entidad.tipo == 'empresa') {
              return Empresa.edit(solicitud.entidad.id, solicitud.entidad, connection.client)
                .then(r => {
                    return connector.commit(connection.client)
                          .then(r => {
                            connection.done();
                            return id
                          });                  
                })
            }  
        })
        .catch(e => {
          connector.rollback(connection.client);
          connection.done();
          throw Error(e);
        });       
    })
}


module.exports.patch = function (id, solicitud, client) {
  let query = table.update(solicitud)
    .where(table.id.equals(id))
    .toQuery();
    
  return connector.execQuery(query, client);
}