const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const TipoContacto = require('./tipos/TipoContacto');

const table = sql.define({
  name: 'contacto',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'int'
    },
    {
      name: 'valor',
      dataType: 'varchar(255)'
    },
    {
      name: 'entidad',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 't_contacto',
      columns: [ 'tipo' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'entidad',
      columns: [ 'entidad' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addContacto(contacto, client) {
  let query = table.insert(
    table.tipo.value(contacto.tipo), table.valor.value(contacto.valor),
    table.entidad.value(contacto.entidad)
  ).returning(table.id, table.tipo, table.valor).toQuery();

  return connector.execQuery(query, client)
         .then(r => {
           let contacto_added = r.rows[0];
           return contacto_added;
         })
}

module.exports.addContacto = addContacto;

module.exports.getAll = function(id_entidad) {
  let query = table.select(
    table.id, table.valor,
    TipoContacto.table.valor.as('tipo')
  ).from(
    table.join(TipoContacto.table).on(table.tipo.equals(TipoContacto.table.id))
  ).where(table.entidad.equals(id_entidad))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(
    table.id, table.valor,
    TipoContacto.table.valor.as('tipo')
  ).from(
    table.join(TipoContacto.table).on(table.tipo.equals(TipoContacto.table.id))
  ).where(table.id.equals(id))
  .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

module.exports.delete = function(id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}