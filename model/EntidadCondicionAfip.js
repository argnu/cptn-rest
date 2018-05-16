const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const TipoCondicionAfip = require('./tipos/TipoCondicionAfip');

const table = sql.define({
  name: 'entidad_condicion_afip',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'entidad',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'condicion_afip',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'descripcion',
      dataType: 'text',
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'entidad' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_condicionafip',
      columns: [ 'condicion_afip' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.entidad,
  table.descripcion,
  TipoCondicionAfip.table.id.as('condicion_afip.id'),
  TipoCondicionAfip.table.valor.as('condicion_afip.valor')
]

const from = table.join(TipoCondicionAfip.table).on(table.condicion_afip.equals(TipoCondicionAfip.table.id));

module.exports.getByEntidad = function(id_entidad) {
  try {
    let query = table.select(select).from(from)
                     .where(table.entidad.equals(id_entidad))
                     .toQuery();
  
    return connector.execQuery(query)
    .then(r => r.rows.map(row => dot.object(row)))
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

module.exports.add = function(data, client) {
  try {
    let query = table.insert(
      table.descripcion.value(data.descripcion),
      table.entidad.value(data.entidad),
      table.condicion_afip.value(data.condicion_afip)
    )
    .returning(table.id, table.descripcion, table.entidad, table.condicion_afip)
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

module.exports.edit = function(id, data, client) {
  try {
    let query = table.update({
      descripcion: data.descripcion,
      condicion_afip: data.condicion_afip
    })
    .where(table.id.equals(id))
    .returning(table.id, table.descripcion, table.entidad, table.condicion_afip)
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

module.exports.delete = function(id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}

module.exports.deleteByEntidad = function(id_entidad, client) {
  let query = table.delete()
                   .where(table.entidad.equals(id_entidad))
                   .returning(table.star())
                   .toQuery();

  return connector.execQuery(query, client)
  .then(r => id_entidad);
}