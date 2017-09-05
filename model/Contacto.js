const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Opcion = require('./Opcion');

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
      table: 'opcion',
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

function addContacto(client, contacto) {
  let query = table.insert(
    table.tipo.value(contacto.tipo), table.valor.value(contacto.valor),
    table.entidad.value(contacto.entidad)
  ).returning(table.id).toQuery();

  return connector.execQuery(query, client)
         .then(r => {
           contacto.id = r.rows[0].id;
           return contacto;
         })
}

module.exports.addContacto = addContacto;

module.exports.getAll = function(id_entidad) {
  let query = table.select(
    table.id, table.valor,
    Opcion.table.valor.as('tipo')
  ).from(
    table.join(Opcion.table).on(table.tipo.equals(Opcion.table.id))
  ).where(table.entidad.equals(id_entidad))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.get = function(id) {
  let query = table.select(
    table.id, table.valor,
    Opcion.table.valor.as('tipo')
  ).from(
    table.join(Opcion.table).on(table.tipo.equals(Opcion.table.id))
  ).where(table.id.equals(id))
  .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}
