const dot = require('dot-object');
const moment = require('moment');
const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');

const utils = require(`../../utils`);
const TipoEstadoBoleta = require('../tipos/TipoEstadoBoleta');
const VolantePagoBoleta = require('./VolantePagoBoleta');
const Boleta = require('./Boleta');
const ValoresGlobales = require('../ValoresGlobales');

const table = sql.define({
    name: 'volante_pago',
    columns: [
        {
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
          name: 'fecha_vencimiento',
          dataType: 'date',
          notNull: true
        },
        {
          name: 'estado',
          dataType: 'int',
          notNull: true
        },        
        {
          name: 'subtotal',
          dataType: 'float',
        },
        {
          name: 'interes_total',
          dataType: 'float',
        },
        {
          name: 'bonificacion_total',
          dataType: 'float',
        },
        {
          name: 'importe_total',
          dataType: 'float',
        },
        {
          name: 'delegacion',
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
        },
        {
          name: 'vencido',
          dataType: 'boolean',
          defaultValue: 'false'
        }
    ],

    foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id'],
        onDelete: 'cascade'
      },
      {
        table: 'delegacion',
        columns: ['delegacion'],
        refColumns: ['id']
      },
      {
        table: 't_estadoboleta',
        columns: ['estado'],
        refColumns: ['id']
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
})

module.exports.table = table;

const select = [
  table.id,
  table.matricula,
  table.fecha.cast('varchar(10)'),
  table.fecha_vencimiento.cast('varchar(10)'),
  table.subtotal,
  table.interes_total,
  table.bonificacion_total,
  table.importe_total,
  table.delegacion,
  TipoEstadoBoleta.table.id.as('estado.id'),
  TipoEstadoBoleta.table.valor.as('estado.valor'),
  table.vencido,
  table.created_by,
  table.updated_by
]

const from = table.join(TipoEstadoBoleta.table).on(table.estado.equals(TipoEstadoBoleta.table.id));

function getBoletas(id_volante) {
  let datos_volante;
  let table = VolantePagoBoleta.table;
  let query = table.select(table.star())
       .where(table.volante.equals(id_volante))
       .toQuery();

  return connector.execQuery(query)
  .then(r => {
    datos_volante = r.rows;
    return Promise.all(r.rows.map(b => Boleta.get(b.boleta)));
  })
  .then(boletas => {
    boletas.forEach((b, i) => b.interes = datos_volante[i].interes);
    return boletas;
  })
}

module.exports.getBoletas = getBoletas;

module.exports.get = function(id) {
  let volante;
  let query = table.select(select)
  .from(from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    volante = dot.object(r.rows[0]);
    return getBoletas(id);
  })
  .then(boletas => {
    volante.boletas = boletas;
    return volante;
  });
}

module.exports.getAll = function(params) {
  let query = table.select(select).from(from);

  if (params.matricula) query.where(table.matricula.equals(params.matricula));
  if (params.estado) query.where(table.estado.equals(params.estado));
  if (params.vencido) query.where(table.vencido.equals(params.vencido == 'true'));
  if (params.fecha_vencimiento) {
    if (params.fecha_vencimiento.desde) query.where(table.fecha_vencimiento.gte(params.fecha_vencimiento.desde));
    if (params.fecha_vencimiento.hasta) query.where(table.fecha_vencimiento.lte(params.fecha_vencimiento.hasta));  
  }

  if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
  if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)))
  .catch(e => {
    console.error(e);
    return Promise.reject(e);
  })  
}


function addVolante(volante, client) {
  let query = table.insert(
    table.created_by.value(volante.created_by),
    table.updated_by.value(volante.created_by),
    table.matricula.value(volante.matricula),
    table.fecha.value(volante.fecha),
    table.fecha_vencimiento.value(volante.fecha_vencimiento),
    table.subtotal.value(volante.subtotal),
    table.interes_total.value(volante.interes_total),
    table.bonificacion_total.value(volante.bonificacion_total),
    table.importe_total.value(volante.importe_total),
    table.delegacion.value(volante.delegacion),
    table.estado.value(1) //PENDIENTE DE PAGO
  )
  .returning(table.id, table.fecha, table.fecha_vencimiento,
    table.subtotal, table.interes_total, table.bonificacion_total,
    table.importe_total
  )
  .toQuery()

  return connector.execQuery(query, client)
         .then(r => r.rows[0]);
}

module.exports.add = function(volante) {
  let volante_nuevo;
  let conexion;

  return connector
      .beginTransaction()
      .then(con => {
            conexion = con;
            return ValoresGlobales.getValida(6, new Date());
      })
      .then(dias_vencimiento => {
            volante.fecha_vencimiento = moment(volante.fecha).add(dias_vencimiento.valor, 'days');
            return addVolante(volante, conexion.client)
              .then(volante_added => {
                volante_nuevo = volante_added;
                let proms_items = volante.boletas
                                 .map(b => VolantePagoBoleta.add({
                                    volante: volante_nuevo.id,
                                    boleta: b.id,
                                    interes: b.interes
                                  }, conexion.client));

                return Promise.all(proms_items);
              })
              .then(r => {
                //10 es 'volante generado'
                let proms_boletas = volante.boletas.map(b => Boleta.patch(b.id, { estado: 10 }, conexion.client));
                return Promise.all(proms_boletas);
              })
              .then(r => {
                return connector.commit(conexion.client)
                .then(r => {
                  conexion.done();
                  return volante_nuevo;
                });
              })
              .catch(e => {
                connector.rollback(conexion.client);
                conexion.done();
                return Promise.reject(e);
              });
        });
}


module.exports.patch = function(id, volante, client) {
  volante.updated_at = new Date();

  let query = table.update(volante).where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}

module.exports.anular = function(id, volante) {
  let conexion;

  return connector
  .beginTransaction()
  .then(con => {
      conexion = con;
      volante.updated_at = new Date();
      volante.estado = 11; //VOLANTE ANULADO

      let query = table.update(volante)
      .where(table.id.equals(id))
      .toQuery();

      return connector.execQuery(query, conexion.client)
      .then(r => getBoletas(id))
      .then(boletas => {
          return Promise.all(boletas.map(b => Boleta.patch(b.id, {
              estado: 1,  //PENDIENTE DE PAGO
              updated_by: volante.updated_by
          }, conexion.client)))
      })
      .then(r => {
          return connector.commit(conexion.client)
              .then(r => {
                  conexion.done();
                  return volante;
              });
      })
      .catch(e => {
          connector.rollback(conexion.client);
          conexion.done();
          return Promise.reject(e);
      });        
  })
}