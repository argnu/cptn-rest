const connector = require('../connector');
const Domicilio = require('./Domicilio');
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
  name: 'empresa',
  columns: [
    {
      name: 'id',
      dataType: 'int',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'fechaInicio',
      dataType: 'date'
    },
    {
      name: 'tipoEmpresa',
      dataType: 'int'
    },
    {
      name: 'tipoSociedad',
      dataType: 'int'
    },
    {
      name: 'fechaConstitucion',
      dataType: 'date'
    },
    {
      name: 'condafip',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'id' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'opcion',
      columns: [ 'tipoEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'opcion',
      columns: [ 'tipoSociedad' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'opcion',
      columns: [ 'tipoEmpresa' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;
