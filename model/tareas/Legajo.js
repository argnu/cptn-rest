const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const LegajoItem = require('./LegajoItem')
const Item = require('./Item')
const Comitente = require('./Comitente')
const Domicilio = require(`${__base}/model/Domicilio`);

const table = sql.define({
    name: 'legajo',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'solicitud',
            dataType: 'int'
        },
        {
            name: 'numero_legajo',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'tipo',
            dataType: 'int',
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha_solicitud',
            dataType: 'date',
        },
        {
            name: 'comitente',
            dataType: 'int',
        },
        {
            name: 'domicilio',
            dataType: 'int',
        },
        {
            name: 'nomenclatura',
            dataType: 'varchar(255)',
        },
        {
            name: 'estado',
            dataType: 'varchar(255)',
        },
        {
            name: 'subcategoria',
            dataType: 'int',
        },
        {
            name: 'incumbencia',
            dataType: 'int',
        },
        {
            name: 'honorarios_presupuestados',
            dataType: 'float',
        },
        {
            name: 'forma_pago',
            dataType: 'varchar(255)',
        },
        {
            name: 'plazo_cumplimiento',
            dataType: 'date',
        },
        {
            name: 'honorarios_reales',
            dataType: 'float',
        },
        {
            name: 'porcentaje_cumplimiento',
            dataType: 'int',
        },
        {
            name: 'finalizacion_tarea',
            dataType: 'date',
        },
        {
            name: 'tarea_publica',
            dataType: 'boolean',
        },
        {
            name: 'dependencia',
            dataType: 'boolean',
        },
        {
            name: 'aporte_bruto',
            dataType: 'float',
        },
        {
            name: 'aporte_neto',
            dataType: 'float',
        },
        {
            name: 'aporte_neto_bonificacion',
            dataType: 'float',
        },
        {
            name: 'cantidad_planos',
            dataType: 'int',
        },
        {
            name: 'observaciones',
            dataType: 'text',
        },
        {
            name: 'observaciones_internas',
            dataType: 'text',
        },
        {
            name: 'informacion_adicional',
            dataType: 'text',
        },
        {
            name: 'evaluador',
            dataType: 'varchar(30)',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
        {
            name: 'numero_acta',
            dataType: 'varchar(50)',
        },
        {
            name: 'operador_carga',
            dataType: 'varchar(30)',
        },
        {
            name: 'operador_aprobacion',
            dataType: 'varchar(30)',
        }

    ],

    foreignKeys: [{
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id']
        },
        {
            table: 'tarea_subcategoria',
            columns: ['subcategoria'],
            refColumns: ['id']
        },
        {
            table: 'comitente',
            columns: ['comitente'],
            refColumns: ['id']
        },
        {
            table: 't_incumbencia',
            columns: ['incumbencia'],
            refColumns: ['id']
        },
        {
            table: 'domicilio',
            columns: ['domicilio'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

module.exports.getBySolicitud = function (id_solicitud) {
    let query = table.select(table.id)
      .from(table)
      .where(table.solicitud.equals(id_solicitud))
      .toQuery();
    return connector.execQuery(query)
      .then(r => r.rows[0]);
}

function getItems(id_legajo) {
  let table = LegajoItem.table;
  let query = table.select(table.star()).from(table)
                   .where(table.legajo.equals(id_legajo))
                   .toQuery();
  let items = [];

 return connector.execQuery(query)
   .then(r => {
     items = r.rows;
     return Promise.all(items.map(i => getItemData(i.item)))
   })
   .then(data => {
     items.forEach((item, i) => {
       item.item = data[i];
     });
     return items;
   })
}

function getItemData(id_item) {
  let table = Item.table;
  let query = table.select(table.star()).from(table)
                   .where(table.id.equals(id_item))
                   .toQuery();

 return connector.execQuery(query)
   .then(r => r.rows[0]);
}

function getComitente(id_comitente) {
  let table = Comitente.table;
  let query = table.select(table.star()).from(table)
                   .where(table.id.equals(id_comitente))
                   .toQuery();

 return connector.execQuery(query)
   .then(r => r.rows[0]);
}

module.exports.getAll = function(params) {
  let legajos = [];
  let query = table.select(table.star()).from(table);
  query.where(table.tipo.notEquals(0)); // EVITAR LOS ANULADOS
  if (params.matricula) query.where(table.matricula.equals(params.matricula));

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
    .then(r => {
      legajos = r.rows;
      return Promise.all(r.rows.map(m => getItems(m.id)))
    })
    .then(items => {
      legajos.forEach((legajo, i) => {
        legajo.items = items[i];
      });
      return legajos;
    })
}

module.exports.get = function(id) {
  let legajos;
  let query = table.select(table.star())
                   .from(table)
                   .where(table.id.equals(id));

  return connector.execQuery(query.toQuery())
    .then(r => {
      legajo = r.rows[0];
      return Promise.all([
        getItems(legajo.id),
        getComitente(legajo.comitente),
        Domicilio.getDomicilio(legajo.domicilio)
      ])
    })
    .then(([items, comitente, domicilio]) => {
      legajo.items = items;
      legajo.comitente = comitente;
      legajo.domicilio = domicilio;
      return legajo;
    })
}


function getNumeroLegajo() {
  let query = table.select(table.numero_legajo.max().as('numero')).toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0].numero + 1);
}



function addLegajo(legajo, client) {

  let query = table.insert(
    table.matricula.value(legajo.matricula),
    table.aporte_bruto.value(legajo.aporte_bruto),
    table.aporte_neto.value(legajo.aporte_neto),
    table.cantidad_planos.value(legajo.cantidad_planos),
    table.comitente.value(legajo.comitente),
    table.domicilio.value(legajo.domicilio),
    table.delegacion.value(legajo.delegacion),
    table.dependencia.value(legajo.dependencia),
    table.estado.value('Pendiente'),
    table.fecha_solicitud.value(legajo.fecha_solicitud),
    table.finalizacion_tarea.value(legajo.finalizacion_tarea),
    table.forma_pago.value(legajo.forma_pago),
    table.honorarios_presupuestados.value(legajo.honorarios_presupuestados),
    table.honorarios_reales.value(legajo.honorarios_reales),
    table.informacion_adicional.value(legajo.informacion_adicional),
    table.nomenclatura.value(legajo.nomenclatura),
    table.numero_legajo.value(legajo.numero_legajo),
    table.solicitud.value(legajo.solicitud),
    table.observaciones.value(legajo.observaciones),
    table.plazo_cumplimiento.value(legajo.plazo_cumplimiento),
    table.porcentaje_cumplimiento.value(legajo.porcentaje_cumplimiento),
    table.subcategoria.value(legajo.subcategoria),
    table.tarea_publica.value(legajo.tarea_publica),
    table.tipo.value(legajo.tipo)
  )
  .returning(table.id)
  .toQuery()

  return connector.execQuery(query, client)
         .then(r => r.rows[0]);
}

module.exports.add = function(legajo) {
  return connector
      .beginTransaction()
      .then(connection => {
            return Domicilio.addDomicilio(legajo.domicilio, connection.client)
              .then(domicilio_nuevo => {
                legajo.domicilio = domicilio_nuevo.id;
                return Comitente.add(legajo.comitente, connection.client)
              })
              .then(comitente_nuevo => {
                legajo.comitente = comitente_nuevo.id;
                return addLegajo(legajo);
              })
              .catch(e => {
                connector.rollback(connection.client);
                connection.done();
                throw e;
              });
        });
}
