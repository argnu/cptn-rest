const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Localidad = require('./geograficos/Localidad');

const table = sql.define({
  name: 'domicilio',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'calle',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'localidad',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
    table: 'localidad',
    columns: [ 'localidad' ],
    refColumns: [ 'id' ]
  }
});

function addDomicilio(client, domicilio) {
  if (domicilio && domicilio.calle.length && domicilio.numero) {
    let query = table.insert(
      table.calle.value(domicilio.calle),
      table.numero.value(domicilio.numero),
      table.localidad.value(domicilio.localidad)
    ).returning(table.id, table.calle, table.numero, table.localidad).toQuery()
    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
  }
  else Promise.resolve(null);
}


function getDomicilio(id) {
  let query = table.select(
                      table.id, table.calle, table.numero,
                      Localidad.table.nombre.as('localidad')
                    )
                   .from(
                     table.join(Localidad.table)
                          .on(table.localidad.equals(Localidad.table.id))
                   )
                   .where(table.id.equals(id))
                   .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}


module.exports.table = table;
module.exports.addDomicilio = addDomicilio;
module.exports.getDomicilio = getDomicilio;
