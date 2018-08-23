const connector = require(`../db/connector`);
const dot = require('dot-object');
const sql = require('node-sql-2');
sql.setDialect('postgres');
const Localidad = require('./geograficos/Localidad');
const Departamento = require('./geograficos/Departamento');
const Provincia = require('./geograficos/Provincia');
const Pais = require('./geograficos/Pais');
const utils = require(`../utils`);

const table = sql.define({
  name: 'domicilio',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'direccion',
      dataType: 'varchar(100)',
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


module.exports.table = table;

module.exports.get = function(id) {
  try {
    let query = table.select(
      table.id, 
      table.direccion,
      Localidad.table.id.as('localidad.id'),
      Localidad.table.nombre.as('localidad.nombre'),
      Departamento.table.id.as('departamento.id'),
      Departamento.table.nombre.as('departamento.nombre'),
      Provincia.table.id.as('provincia.id'),
      Provincia.table.nombre.as('provincia.nombre'),
      Pais.table.id.as('pais.id'),
      Pais.table.nombre.as('pais.nombre')
    )
    .from(
      table.join(Localidad.table).on(table.localidad.equals(Localidad.table.id))
      .join(Departamento.table).on(Localidad.table.departamento.equals(Departamento.table.id))
      .join(Provincia.table).on(Departamento.table.provincia.equals(Provincia.table.id))
      .join(Pais.table).on(Provincia.table.pais.equals(Pais.table.id))
    )
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0] ? dot.object(r.rows[0]) : r.rows[0])
    .catch(e => {
      console.error(e);
      return Promise.reject(e);      
    })
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
}

module.exports.add = function(domicilio, client) {
  try {
    let query = table.insert(
      table.direccion.value(domicilio.direccion),
      table.localidad.value(domicilio.localidad)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0])
    .catch(e => {
      console.error(e);
      return Promise.reject(e);      
    })
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
}

module.exports.edit = function(id, domicilio, client) {
  try {
    let query = table.update({
      direccion: domicilio.direccion,
      localidad: domicilio.localidad
    })
    .where(table.id.equals(id))
    .returning(table.id)
    .toQuery();

    return connector.execQuery(query)
    .then(r => ({ id }))
    .catch(e => {
      console.error(e);
      return Promise.reject(e);      
    });
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }  
}

module.exports.delete = function(id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}