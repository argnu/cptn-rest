const connector = require('../../connector');
const utils = require('../../utils');
const sql = require('sql');
sql.setDialect('postgres');
const Departamento = require('./Departamento');

const table = sql.define({
  name: 'localidad',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)'
    },
    {
      name: 'departamento',
      dataType: 'int'
    }
  ],

  foreignKeys: {
      table: 'departamento',
      columns: [ 'departamento' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.id, table.nombre)
  .from(table.join(Departamento.table).on(table.departamento.equals(Departamento.table.id)));

  if (params.departamento_id) query.where(table.departamento.equals(params.departamento_id));
  if (params.departamento_text) query.where(Departamento.table.nombre.equals(params.departamento_text));

  return new Promise(function(resolve, reject) {
    connector.execQuery(query.toQuery())
    .then(r => {
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = table.select(table.star()).from(table).toQuery();
    connector.execQuery(query)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
