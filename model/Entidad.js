const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Domicilio = require('./Domicilio');


const table = sql.define({
  name: 'entidad',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'domicilioReal',
      dataType: 'int'
    },
    {
      name: 'domicilioLegal',
      dataType: 'int'
    },
    {
      name: 'condafip',
      dataType: 'int'
    },
    {
      name: 'cuit',
      dataType: 'varchar(20)'
    }
  ],

  foreignKeys: [
    {
      table: 'opcion',
      columns: [ 'condafip' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'domicilio',
      columns: [ 'domicilioReal' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'domicilio',
      columns: [ 'domicilioLegal' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addEntidad(client, entidad) {
  return Promise.all([
    Domicilio.addDomicilio(client, entidad.domicilioReal),
    Domicilio.addDomicilio(client, entidad.domicilioLegal)
  ])
  .then(([domicilioReal, domicilioLegal]) => {
    let query = table.insert(
      table.cuit.value(entidad.cuit), table.condafip.value(entidad.nacionalidad),
      table.domicilioReal.value(domicilioReal.id),
      table.domicilioLegal.value(domicilioLegal.id)
    ).returning(table.id).toQuery();
    return connector.execQuery(query, client)
           .then(r => {
             entidad.id = r.rows[0].id;
             return entidad;
           });
  })
}

module.exports.addEntidad = addEntidad;
