const dot = require('dot-object');
const connector = require(`../db/connector`);
const utils = require('../utils');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const TipoEstadoSolicitud = require('./tipos/TipoEstadoSolicitud');
const Matricula = require('./Matricula');
const Profesional = require('./profesional/Profesional');
const Empresa = require('./empresa/Empresa');

const table = sql.define({
  name: 'solicitud_suspension',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'matricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'motivo',
      dataType: 'text',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'created_by',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'created_at',
      dataType: 'timestamp',
      notNull: true,
      defaultValue: 'CURRENT_DATE'
    },
    {
      name: 'updated_by',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'updated_at',
      dataType: 'timestamp',
      notNull: true,
      defaultValue: 'CURRENT_DATE'
    }    
  ],

  foreignKeys: [
    {
      table: 'matricula',
      columns: [ 'matricula' ],
      refColumns: [ 'id' ],
      onDelete: 'CASCADE'
    },
    {
      table: 't_estadosolicitud',
      columns: [ 'estado' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'usuario',
      columns: [ 'created_by' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'usuario',
      columns: [ 'updated_by' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.fecha,
  table.motivo,
  Matricula.table.id.as('matricula.id'),
  Matricula.table.numeroMatricula.as('matricula.numero'),
  Profesional.table.nombre.as('matricula.profesional.nombre'),
  Profesional.table.apellido.as('matricula.profesional.apellido'),
  Empresa.table.nombre.as('matricula.empresa.nombre'),  
  TipoEstadoSolicitud.table.id.as('estado.id'),
  TipoEstadoSolicitud.table.valor.as('estado.valor'),
  table.created_at,
  table.created_by,
  table.updated_at,
  table.updated_by  
]

const from = table.join(TipoEstadoSolicitud.table).on(table.estado.equals(TipoEstadoSolicitud.table.id))
.join(Matricula.table).on(table.matricula.equals(Matricula.table.id))
.leftJoin(Profesional.table).on(Matricula.table.entidad.equals(Profesional.table.id))
.leftJoin(Empresa.table).on(Matricula.table.entidad.equals(Empresa.table.id))

module.exports.add = function(data, client) {
  let query = table.insert(
    table.matricula.value(data.matricula),
    table.fecha.value(utils.getFecha(data.fecha)),
    table.motivo.value(data.motivo),
    table.estado.value(1),
    table.created_by.value(data.created_by),
    table.updated_by.value(data.created_by)
  )
  .returning(table.star())
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);  
}

function filter(query, params) {
  if (params.estado) query.where(table.estado.equals(params.estado));
  if (params.matricula) query.where(table.matricula.equals(params.matricula));

  if (params.fecha) {
    if (params.fecha.desde) query.where(table.fecha.gte(utils.getFecha(params.fecha.desde)));
    if (params.fecha.hasta) query.where(table.fecha.lte(utils.getFecha(params.fecha.hasta)));
  }

  if (params.filtros) {
    if (params.filtros['matricula.numero']) 
      query.where(Matricula.table.numeroMatricula.ilike(`%${params.filtros['matricula.numero']}%`));
  }
}

module.exports.getAll = function(params) {
  let solicitudes;
  let query = table.select(select).from(from);

  filter(query, params);

  if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
  if (params.sort && params.sort.numero) query.order(table.id[params.sort.numero]);
  if (params.sort && params.sort['matricula.numero']) query.order(Matricula.table.numeroMatricula[params.sort['matricula.numero']]);

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
      solicitudes = r.rows.map(row => dot.object(row));
      solicitudes.forEach(c => {
        if (!c.matricula.empresa.nombre) c.matricula.entidad = c.matricula.profesional;
        else c.matricula.entidad = c.matricula.empresa;
        delete(c.matricula.profesional);
        delete(c.matricula.empresa);
      })

      return utils.getTotalQuery(table, from, (query) => filter(query, params));
  })
  .then(total => ({ totalQuery: total, resultados: solicitudes }))
}

module.exports.get = function(id) {
  let query = table.select(select)
  .from(from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}


module.exports.aprobar = function(id, aprobacion) {
  let conexion;

  return this.get(id)
  .then(solicitud => {
    return connector.beginTransaction()
    .then(con => {
      conexion = con;
      let query = table.update({ 
        estado: 2, 
        updated_by: aprobacion.updated_by,
        updated_at: new Date()
      })
      .where(table.id.equals(id))
      .toQuery(); // Estado de solicitud 'Aprobada'

      return connector.execQuery(query, conexion.client)
      .then(() => {
          let nuevo_estado = {
            matricula: solicitud.matricula.id,
            estado: 25, // Suspendido
            updated_by: aprobacion.updated_by,
            documento: aprobacion.documento
        }
        return Matricula.cambiarEstado(solicitud.matricula.id, nuevo_estado, conexion.client);        
      })
      .then(() => {
        return connector.commit(conexion.client)
            .then(r => {
                conexion.done();
                return { id };
            });
      })
      .catch(e => {
          connector.rollback(conexion.client);
          conexion.done();
          return Promise.reject(e);
      });            
    })
  })
}