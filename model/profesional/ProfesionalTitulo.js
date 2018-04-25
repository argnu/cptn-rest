const dot = require('dot-object');
const connector = require('../../db/connector');
const utils = require('../../utils');
const sql = require('sql');
sql.setDialect('postgres');

const InstitucionTitulo = require('../InstitucionTitulo');
const Institucion = require('../Institucion');
const TipoNivelTitulo = require('../tipos/TipoNivelTitulo');


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
      refColumns: [ 'id' ],
      onDelete: 'CASCADE'
    },
    {
      table: 'institucion_titulo',
      columns: [ 'titulo' ],
      refColumns: [ 'id' ]
    }
  ]

});

module.exports.table = table;

const select = [
  table.id,
  table.profesional,
  table.fechaEmision,
  table.fechaEgreso,
  InstitucionTitulo.table.id.as('titulo.id'),
  InstitucionTitulo.table.nombre.as('titulo.nombre'),
  InstitucionTitulo.table.tipo_matricula.as('titulo.tipo_matricula'),
  Institucion.table.id.as('titulo.institucion.id'),
  Institucion.table.nombre.as('titulo.institucion.nombre'),
  Institucion.table.cue.as('titulo.institucion.cue'),
  TipoNivelTitulo.table.id.as('titulo.nivel.id'),
  TipoNivelTitulo.table.valor.as('titulo.nivel.valor')
]

const from = table.join(InstitucionTitulo.table).on(table.titulo.equals(InstitucionTitulo.table.id))
.join(Institucion.table).on(InstitucionTitulo.table.institucion.equals(Institucion.table.id))
.join(TipoNivelTitulo.table).on(InstitucionTitulo.table.nivel.equals(TipoNivelTitulo.table.id));

module.exports.getByProfesional = function(id) {
  let query = table.select(select).from(from)
  .where(table.profesional.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.add = function(data, client) {
  let query = table.insert(
    table.profesional.value(data.profesional),
    table.titulo.value(data.titulo),
    table.fechaEgreso.value(data.fechaEgreso),
    table.fechaEmision.value(utils.checkFecha(data.fechaEmision))
  )
  .returning(table.id, table.profesional, table.titulo, table.fechaEgreso, table.fechaEmision)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
}

module.exports.edit = function(id, data, client) {
  let query = table.update({
    titulo: data.titulo.id ? data.titulo.id : data.titulo,
    fechaEgreso: data.fechaEgreso,
    fechaEmision: utils.checkFecha(data.fechaEmision)
  })
  .where(table.id.equals(id))
  .returning(table.id, table.profesional, table.titulo, table.fechaEgreso, table.fechaEmision)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
}


module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}