const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'contacto',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'varchar(255)'
    },
    {
      name: 'valor',
      dataType: 'varchar(255)'
    },
    {
      name: 'profesional',
      dataType: 'int'
    }
  ],

  foreignKeys: {
    table: 'profesional',
    columns: [ 'profesional' ],
    refColumns: [ 'id' ]
  }
});

module.exports.table = table;

function addContacto(client, contacto) {
  let query = table.insert(
    table.tipo.value(contacto.tipo), table.valor.value(contacto.valor),
    table.profesional.value(contacto.profesional)
  ).toQuery();

  return connector.execQuery(query, client);
}

module.exports.addContacto = addContacto;

module.exports.add = function(contacto) {
  return addContacto(pool, contacto);
}

module.exports.getAll = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.profesional.equals(id))
       .toQuery();
  return connector.execQuery(query);
}

module.exports.get = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.id.equals(id))
       .toQuery();
  return connector.execQuery(query);
}
