const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const EntidadDomicilio = require('./EntidadDomicilio');



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
      name: 'condafip',
      dataType: 'int'
    },
    {
      name: 'cuit',
      dataType: 'varchar(20)'
    },
    {
      name: 'recibirActualizaciones',
      dataType: 'boolean'
    }
  ],

  foreignKeys: [
    {
      table: 't_condicionafip',
      columns: [ 'condafip' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

module.exports.add = function(entidad, client) {
  let entidad_added;
  let query = table.insert(
    table.tipo.value(entidad.tipo),
    table.cuit.value(entidad.cuit), 
    table.condafip.value(entidad.condafip),
    table.recibirActualizaciones.value(entidad.recibirActualizaciones)
  )
  .returning(table.star())
  .toQuery();
  
  return connector.execQuery(query, client)
          .then(r => {
            entidad_added = r.rows[0];
            let proms = entidad.domicilios.map(d => {
              d.entidad = entidad_added.id;
              return EntidadDomicilio.add(d, client);
            });
            return Promise.all(proms);
          })
          .then(domicilios => {
            entidad_added.domicilios = domicilios;
            return entidad_added;
          });
};


module.exports.edit = function(id, entidad, client) {
  // return EntidadDomicilio.deleteByEntidad(entidad.id, client)
  // .then(r => {
    let query = table.update({
      condafip: entidad.condafip,
      cuit: entidad.cuit
    })
    .where(table.id.equals(id))
    .toQuery();
  
    return connector.execQuery(query, client);
  // })
  // .then(r => {
  //   let proms_domicilios = entidad.domicilios.map(d => {
  //     d.entidad = id;
  //     return EntidadDomicilio.add(d, client);
  //   });
  //   return Promise.all(proms_domicilios);    
  // })
  // .then(r => id); 
}