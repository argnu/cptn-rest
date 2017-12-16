const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const VolantePagoBoleta = require('./VolantePagoBoleta');
const Boleta = require('./Boleta');

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
          dataType: 'int',
          // Agregar foreign key una vez que se confirmen los datos
        },
        {
          name: 'pagado',
          dataType: 'boolean'
        }
    ],

    foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']
      }
  ]    
})

module.exports.table = table;

function addVolante(volante, client) {
  let query = table.insert(
    table.matricula.value(volante.matricula),
    table.fecha.value(volante.fecha),
    table.fecha_vencimiento.value(volante.fecha_vencimiento),
    table.subtotal.value(volante.subtotal),
    table.interes_total.value(volante.interes_total),
    table.bonificacion_total.value(volante.bonificacion_total),
    table.importe_total.value(volante.importe_total),
    table.delegacion.value(volante.delegacion),
    table.pagado.value(false)
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
  
  return connector
      .beginTransaction()
      .then(connection => {
            return addVolante(volante, connection.client)
              .then(volante_added => {
                volante_nuevo = volante_added;
                let proms_items = volante.boletas
                                 .map(b => VolantePagoBoleta.add({ 
                                    volante: volante_nuevo.id, 
                                    boleta: b.id,
                                    interes: b.interes 
                                  }, connection.client));
                                  
                return Promise.all(proms_items);
              })
              .then(r => {
                //10 es 'volante generado'
                let proms_boletas = volante.boletas.map(b => Boleta.patch(b.id, { estado: 10 }, connection.client));
                return Promise.all(proms_boletas);
              })
              .then(r => {
                return connector.commit(connection.client)
                .then(r => {
                  connection.done();
                  return volante_nuevo;
                });
              })
              .catch(e => {
                connector.rollback(connection.client);
                connection.done();
                throw Error(e);
              });
        });
}

module.exports.patch = function(id, volante, client) {
  let query = table.update(volante).where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}


function getBoletas(id_volante) {
  let datos_volante;
  let table = VolantePagoBoleta.table;
  let query = table.select(table.star())
       .where(table.volante.equals(id_volante))
       .toQuery();

  return connector.execQuery(query)
         .then(r => { 
            datos_volante = r.rows;
            return Promise.all(r.rows.map(b => Boleta.get(b.id)));
          })
          .then(boletas => {
            boletas.forEach((b, i) => b.interes = datos_volante[i].interes);
            return boletas;
          })
}

module.exports.get = function(id) {
  let volante;
  let query = table.select(table.star())
                   .where(table.id.equals(id))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => {
            volante = r.rows[0];
            return getBoletas(id);
         })
         .then(boletas => {
           volante.boletas = boletas;
           return volante;
         });
}

module.exports.getAll = function(params) {
  let volantes = [];
  let query = table.select(table.star()).from(table);

  if (params.matricula) query.where(table.matricula.equals(params.matricula));
  if (params.pagado) query.where(table.pagado.equals(params.pagado == 'true'));
  if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
  if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);  

  return connector.execQuery(query.toQuery())
  .then(r => {
      volantes = r.rows;
      let proms = volantes.map(v => getBoletas(v.id));
      return Promise.all(proms);
  })
  .then(boletas_list => {
    boletas_list.forEach((boletas, index) => {
          volantes[index].boletas = boletas;
      });
    return volantes;
  })  
}