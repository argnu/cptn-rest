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
      name: 'tipo',
      dataType: 'varchar(20)',
      notNull: true
    },
    {
      name: 'domicilioReal',
      dataType: 'int'
    },
    {
      name: 'domicilioProfesional',
      dataType: 'int'
    },
    {
      name: 'domicilioConstituido',
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
      columns: [ 'domicilioProfesional' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'domicilio',
      columns: [ 'domicilioConstituido' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addEntidad(entidad, client) {
  return Promise.all([
    Domicilio.addDomicilio(entidad.domicilioReal, client),
    Domicilio.addDomicilio(entidad.domicilioProfesional, client),
    Domicilio.addDomicilio(entidad.domicilioConstituido, client)
  ])
  .then(([domicilioReal, domicilioProfesional, domicilioConstituido]) => {
    let query = table.insert(
      table.tipo.value(entidad.tipo),
      table.cuit.value(entidad.cuit), table.condafip.value(entidad.condafip),
      table.domicilioReal.value(domicilioReal ? domicilioReal.id : null),
      table.domicilioProfesional.value(domicilioProfesional ? domicilioProfesional.id : null),
      table.domicilioConstituido.value(domicilioConstituido ? domicilioConstituido.id : null)
    ).returning(table.id, table.cuit, table.condafip).toQuery();
    return connector.execQuery(query, client)
           .then(r => {
             let entidad_added = r.rows[0];
             entidad_added.domicilioReal = domicilioReal || null;
             entidad_added.domicilioProfesional = domicilioProfesional || null;
             entidad_added.domicilioConstituido = domicilioConstituido || null;
             return entidad_added;
           });
  })
}

module.exports.addEntidad = addEntidad;
