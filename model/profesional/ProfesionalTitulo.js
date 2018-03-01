const connector = require('../../db/connector');
const utils = require('../../utils');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'profesional_titulo',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'titulo',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fechaEmision',
      dataType: 'date'
    },
    {
      name: 'fechaEgreso',
      dataType: 'date'
    } 
  ],

  foreignKeys: [
    {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'titulo',
      columns: [ 'titulo' ],
      refColumns: [ 'id' ]
    }
  ]

});

module.exports.table = table;


module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}