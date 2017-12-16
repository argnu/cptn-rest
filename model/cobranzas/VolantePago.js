const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const VolantePagoBoleta = require('./VolantePagoBoleta');

const table = sql.define({
    name: 'volante_pago',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'tasa',
            dataType: 'float',
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
        }
    ]
})

module.exports.table = table;

function addVolante(volante) {
  let query = table.insert(
    table.tasa.value(volante.tasa),
    table.fecha.value(volante.fecha),
    table.fecha_vencimiento.value(volante.fecha_vencimiento)
  )
  .returning(table.id, table.tasa, table.fecha, table.fecha_vencimiento)
  .toQuery();

  return connector.execQuery(query)
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
                                 .map(b => VolantePagoBoleta.add({ volante: volante_nuevo.id, boleta: b.id }, connection.client));
                return Promise.all(proms_items);
              })
              .then(r => {
                let proms_boletas = volante.boletas.map(b => Boleta.patch(b.id, { estado: 10 }, connection.client)); //10 es 'volante generado'
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
