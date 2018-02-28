const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const TipoEstadoMatricula = require('./tipos/TipoEstadoMatricula');
const TipoDocumento = require('./tipos/TipoDocumento');
const Documento = require('./Documento');

 const table = sql.define({
  name: 'matricula_historial',
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
      name: 'estado',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'documento',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'usuario',
      dataType: 'varchar(45)',
      notNull: true
    }
  ],

  foreignKeys: [
      {
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']          
      },
      {
        table: 't_estadomatricula',
        columns: ['estado'],
        refColumns: ['id']          
      },
      {
        table: 'documento',
        columns: ['documento'],
        refColumns: ['id']          
      },
      {
        table: 'usuario',
        columns: ['usuario'],
        refColumns: ['id']          
      }
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.matricula,
  table.usuario,
  table.fecha,
  TipoEstadoMatricula.table.id.as('estado.id'),
  TipoEstadoMatricula.table.valor.as('estado.valor'),
  Documento.table.id.as('documento.id'),
  Documento.table.numero.as('documento.numero'),
  Documento.table.fecha.as('documento.fecha'),
  TipoDocumento.table.id.as('documento.tipo.id'),
  TipoDocumento.table.valor.as('documento.tipo.valor')
]

const from = table.join(TipoEstadoMatricula.table).on(table.estado.equals(TipoEstadoMatricula.table.id))
.join(Documento.table).on(table.documento.equals(Documento.table.id))
.join(TipoDocumento.table).on(Documento.table.tipo.equals(TipoDocumento.table.id));

module.exports.getAll = function(params) {
  let query = table.select(select).from(from);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.getByMatricula = function(id) {
  let query = table.select(select).from(from).where(table.matricula.equals(id));

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function(id) {
  let query = table.select(select).from(from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.matricula.value(data.matricula),
    table.estado.value(data.estado),
    table.documento.value(data.documento),
    table.fecha.value(data.fecha),
    table.usuario.value(data.usuario)
  )
  .returning(table.id, table.estado, table.documento, table.fecha, table.usuario)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
}