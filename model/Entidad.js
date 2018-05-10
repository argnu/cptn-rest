const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const Domicilio = require('./Domicilio');
const EntidadDomicilio = require('./EntidadDomicilio');
const EntidadCondicionAfip = require('./EntidadCondicionAfip');



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
      name: 'cuit',
      dataType: 'varchar(20)'
    },
    {
      name: 'recibirActualizaciones',
      dataType: 'boolean'
    }
  ],

  foreignKeys: []
});

module.exports.table = table;

module.exports.add = function(entidad, client) {
  try {
    let entidad_added;
    let query = table.insert(
      table.tipo.value(entidad.tipo),
      table.cuit.value(entidad.cuit),
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
      let proms = entidad.condiciones_afip.map(c => {
        c.entidad = entidad_added.id;
        return EntidadCondicionAfip.add(c, client);
      });
      return Promise.all(proms);
  
    })
    .then(condiciones => {
      entidad_added.condiciones_afip = condiciones;
      return entidad_added;
    })
    .catch(e => {
      console.error(e);
      return Promise.reject(e);
    })
  }
  catch (e) {
    console.error(e);
    return Promise.reject(e);    
  }
};


module.exports.edit = function(id, entidad, client) {
  try {
    let domicilios_existentes = entidad.domicilios.filter(d => !!d.id);
    let domicilios_nuevos = entidad.domicilios.filter(d => !d.id);
    let condiciones_existentes = entidad.condiciones_afip.filter(c => !!c.id);
    let condiciones_nuevas = entidad.condiciones_afip.filter(c => !c.id);

    return Promise.all([
      connector.execQuery(
        EntidadDomicilio.table.delete()
        .where(
          EntidadDomicilio.table.entidad.equals(id)
          .and(EntidadDomicilio.table.id.notIn(domicilios_existentes.map(d => d.id)))
        ).toQuery(), client),

      connector.execQuery(
        EntidadCondicionAfip.table.delete().where(
          EntidadCondicionAfip.table.entidad.equals(id)
          .and(EntidadCondicionAfip.table.id.notIn(condiciones_existentes.map(c => c.id)))
        ).toQuery(), client)
    ])
    .then(r => {
      let query = table.update({
        cuit: entidad.cuit
      })
      .where(table.id.equals(id))
      .toQuery();

      return connector.execQuery(query, client)
      .then(r => {
        let proms_domicilios_nuevos = domicilios_nuevos.map(d => {
          d.entidad = id;
          return EntidadDomicilio.add(d, client);
        });

        let proms_domicilios_edit = domicilios_existentes.map(d => Domicilio.edit(d.domicilio.id, d.domicilio, client));
        
        let proms_condiciones_nuevas = condiciones_nuevas.map(c => {
          c.entidad = id;
          return EntidadCondicionAfip.add(c, client);
        });

        let proms_condiciones_edit = condiciones_existentes.map(c => EntidadCondicionAfip.edit(c.id, c, client));

        return Promise.all([
          Promise.all(proms_domicilios_nuevos),
          Promise.all(proms_domicilios_edit),
          Promise.all(proms_condiciones_nuevas),
          Promise.all(proms_condiciones_edit)
        ]);
      })
      .catch(e => {
        console.log(e);
        console.log('Error en Entidad.edit');
        return Promise.reject(e);
      })
    })
    .catch(e => {
      console.log(e);
      console.log('Error en Entidad.edit');
      return Promise.reject(e);
    })
  }
  catch (e) {
    console.log(e);
    console.log('Error en Entidad.edit');
    throw Error(e);
  }
}