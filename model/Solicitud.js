const connector = require('../db/connector');
const utils = require('../utils');
const sql = require('node-sql-2');
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
      dataType: 'int',
    },
    {
      name: 'updated_by',
      dataType: 'int',
    },
    {
      name: 'created_at',
      dataType: 'timestamptz',
      defaultValue: 'current_date'
    },
    {
      name: 'updated_at',
      dataType: 'timestamptz',
      defaultValue: 'current_date'
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
      refColumns: ['id'],
      onUpdate: 'CASCADE'
    },
    {
      table: 'usuario',
      columns: ['updated_by'],
      refColumns: ['id'],
      onUpdate: 'CASCADE'
    }
  ]
});

module.exports.table = table;

function addSolicitud(solicitud, client) {
  let query = table.insert(
    table.created_by.value(solicitud.created_by),
    table.updated_by.value(solicitud.created_by),
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
    return Promise.reject(e);
  });
}

const select = [
  table.id,
  table.fecha.cast('varchar(10)'),
  table.numero,
  table.updated_by,
  table.created_by,
  table.entidad,
  TipoEstadoSolicitud.table.valor.as('estado'),
  Delegacion.table.nombre.as('delegacion'),
  Entidad.table.tipo.as('tipoEntidad')
]

const from = table.join(TipoEstadoSolicitud.table).on(table.estado.equals(TipoEstadoSolicitud.table.id))
.join(Delegacion.table).on(table.delegacion.equals(Delegacion.table.id))
.join(Entidad.table).on(table.entidad.equals(Entidad.table.id))
.leftJoin(Profesional.table).on(table.entidad.equals(Profesional.table.id))
.leftJoin(Empresa.table).on(table.entidad.equals(Empresa.table.id))

function filter(query, params) {
  if (params.entidad.tipo) query.where(Entidad.table.tipo.equals(params.entidad.tipo));
  if (params.estado) query.where(TipoEstadoSolicitud.table.valor.equals(params.estado));
  if (params.numero && !isNaN(+params.numero)) query.where(table.numero.equals(+params.numero));

  if (params.filtros) {
    if (params.filtros.numero && !isNaN(+params.filtros.numero)) query.where(table.numero.cast('text').ilike(`%${params.filtros.numero}%`));
    if (params.filtros['entidad.cuit']) query.where(Entidad.table.cuit.like(`%${params.filtros['entidad.cuit']}%`));
    if (params.filtros['empresa.nombre']) query.where(Empresa.table.nombre.ilike(`%${params.filtros['empresa.nombre']}%`));
    if (params.filtros['profesional.dni']) query.where(Profesional.table.dni.like(`%${params.filtros['profesional.dni']}%`));
    if (params.filtros['profesional.apellido']) query.where(Profesional.table.apellido.ilike(`%${params.filtros['profesional.apellido']}%`));
  }
}

module.exports.getAll = function(params) {
    let resultados = [];
    let query = table.select(select).from(from);

    filter(query, params);

    /* ---------------- SORTING ------------------ */
    if (params.sort) {
      if (params.sort.numero) query.order(table.numero[params.sort.numero]);
      else if (params.sort.estado) query.order(table.estado[params.sort.estado]);
      else if (params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
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
      resultados = r.rows;
      let proms = resultados.map(s => {
        if (s.tipoEntidad == 'profesional') return Profesional.get(s.entidad)
        else if (s.tipoEntidad == 'empresa') return Empresa.get(s.entidad);
      });

      return Promise.all(proms)
      .then(rs => {
        rs.forEach((r, i) => {
        resultados[i].entidad = r;
          delete(resultados[i].tipoEntidad);
        });

        return utils.getTotalQuery(
        table, from, (query) => {
          filter(query, params);
        })
        .then(totalQuery => ({resultados, totalQuery}))
      });
    });
}

module.exports.get = function(id) {
  let solicitud = {};
  let query = table.select(...select)
                   .from(from)
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
  let connection;

  return connector
    .beginTransaction()
    .then(conn => {
        connection = conn;
        let datos_solicitud = {
          fecha: solicitud.fecha,
          delegacion: solicitud.delegacion,
          updated_by: solicitud.updated_by,
          updated_at: new Date()
        }

        let query = table.update(datos_solicitud)
        .where(table.id.equals(id))
        .toQuery();

        return connector.execQuery(query, connection.client)
        .then(r => {
            if (solicitud.entidad.tipo == 'profesional') {
              return Profesional.edit(solicitud.entidad.id, solicitud.entidad, connection.client);
            }
            else if (solicitud.entidad.tipo == 'empresa') {
              return Empresa.edit(solicitud.entidad.id, solicitud.entidad, connection.client)
            }
        })
        .then(r => {
            return connector.commit(connection.client)
            .then(r => {
              connection.done();
              return solicitud;
            });
        })        
        .catch(e => {
          connector.rollback(connection.client);
          connection.done();
          return Promise.reject(e);
        });
    })
}


module.exports.patch = function (id, solicitud, client) {
  let query = table.update({
    updated_at: new Date(),
    updated_by: solicitud.updated_by,
    estado: solicitud.estado
  })
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query, client);
}