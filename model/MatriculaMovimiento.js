const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const TipoMovimientoMatricula = require('./tipos/TipoMovimientoMatricula');
const TipoDocumento = require('./tipos/TipoDocumento');
const Documento = require('./Documento');

 const table = sql.define({
  name: 'matricula_movimiento',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'matricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'movimiento',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'documento',
      dataType: 'int'
    },
    {
      name: 'created_at',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'created_by',
      dataType: 'int'
    }
  ],

  foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']
      },
      {
        table: 't_movimiento_matricula',
        columns: ['movimiento'],
        refColumns: ['id']
      },
      {
        table: 'documento',
        columns: ['documento'],
        refColumns: ['id']
      },
      {
        table: 'usuario',
        columns: ['created_by'],
        refColumns: ['id'],
        onUpdate: 'CASCADE'
      }
  ]
});

module.exports.table = table;