const connector = require('../db/connector');
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
  let domicilios_existentes = entidad.domicilios.filter(d => !!d.id).map(d => d.id);
  let domicilios_nuevos = entidad.domicilios.filter(d => !d.id);

  let query = EntidadDomicilio.table.delete()
  .where(
    EntidadDomicilio.table.entidad.equals(id)
    .and(EntidadDomicilio.table.id.notIn(domicilios_existentes))
  )
  .toQuery();
  return connector.execQuery(query, client)
  .then(r => {
    let query = table.update({
      condafip: entidad.condafip,
      cuit: entidad.cuit
    })
    .where(table.id.equals(id))
    .toQuery();
  
    return connector.execQuery(query, client)
    .then(r => {
      let proms_domicilios = domicilios_nuevos.map(d => {
        d.entidad = id;
        return EntidadDomicilio.add(d, client);
      });
      return Promise.all(proms_domicilios);        
    })    
  })
}