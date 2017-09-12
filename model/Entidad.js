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
      table: 't_condicionafip',
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

function addEntidad(entidad, client) {
  return Promise.all([
    Domicilio.addDomicilio(client, entidad.domicilioReal),
    Domicilio.addDomicilio(client, entidad.domicilioLegal)
  ])
  .then(([domicilioReal, domicilioLegal]) => {
    let query = table.insert(
      table.cuit.value(entidad.cuit), table.condafip.value(entidad.condafip),
      table.domicilioReal.value(domicilioReal ? domicilioReal.id : null),
      table.domicilioLegal.value(domicilioLegal ? domicilioLegal.id : null)
    ).returning(table.id, table.cuit, table.condafip).toQuery();
    return connector.execQuery(query, client)
           .then(r => {
             let entidad_added = r.rows[0];
             entidad_added.domicilioReal = domicilioReal || null;
             entidad_added.domicilioLegal = domicilioLegal || null;
             return entidad_added;
           });
  })
}

module.exports.addEntidad = addEntidad;
