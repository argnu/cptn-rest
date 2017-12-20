const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'empresa_representante',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'idEmpresa',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'idMatricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fechaInicio',
      dataType: 'date'
    },
    {
      name: 'fechaFin',
      dataType: 'date'
    }
  ],

  foreignKeys: [
    {
      table: 'empresa',
      columns: [ 'idEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'matricula',
      columns: [ 'idMatricula' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

module.exports.add = function(representante, client) {
  let query = table.insert(
                table.idEmpresa.value(representante.empresa),
                table.idMatricula.value(representante.matricula),
                table.fechaInicio.value(representante.fechaInicio)
              )
              .returning(table.id, table.idEmpresa, table.idMatricula, table.fechaInicio)
              .toQuery();

  return connector.execQuery(query, client);
}

module.exports.getAll = function(id_empresa) {
  let query = table.select()
  .where(table.idEmpresa.equals(id_empresa))
  .toQuery();

  return connector.execQuery(query)
        .then(r => r.rows);
}