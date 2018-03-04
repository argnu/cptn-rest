const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const TipoNivelTitulo = require('./tipos/TipoNivelTitulo');

const table = sql.define({
  name: 'institucion_titulo',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'nivel',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'tipo_matricula',
      dataType: 'varchar(10)',
      notNull: true
    },
    {
      name: 'validez_fecha_inicio',
      dataType: 'date'
    },
    {
      name: 'validez_fecha_fin',
      dataType: 'date'
    },
    {
      name: 'valido',
      dataType: 'boolean',
      notNull: true,
      defaultValue: true
    },
    {
      name: 'institucion',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
        table: 't_nivel_titulo',
        columns: ['nivel'],
        refColumns: ['id']
    },
    {
        table: 'institucion',
        columns: ['institucion'],
        refColumns: ['id']
    }
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.nombre,
  table.tipo_matricula,
  table.validez_fecha_inicio,
  table.validez_fecha_fin,
  table.valido,
  table.institucion  ,
  TipoNivelTitulo.table.id.as('nivel.id'),
  TipoNivelTitulo.table.valor.as('nivel.valor')
]

const from = table.join(TipoNivelTitulo.table).on(table.nivel.equals(TipoNivelTitulo.table.id));

module.exports.getAll = function(params) {
  let query = table.select(select).from(from);

  if (params.institucion) query.where(table.institucion.equals(params.institucion));
  if (params.nivel) query.where(table.nivel.equals(params.nivel));

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.getByInstitucion = function(institucion) {
  let query = table.select(select).from(from)
  .where(table.institucion.equals(institucion));

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

module.exports.add = function(titulo) {
  let query = table.insert(
    table.nombre.value(titulo.nombre),
    table.tipo_matricula.value(titulo.tipo_matricula),
    table.nivel.value(titulo.nivel),
    table.validez_fecha_inicio.value(titulo.validez_fecha_inicio),
    table.validez_fecha_fin.value(titulo.validez_fecha_fin),
    table.institucion.value(titulo.institucion)
  )
  .returning(table.id, table.nombre, table.tipo_matricula, 
    table.nivel, table.institucion, table.validez_fecha_fin, table.validez_fecha_inicio)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.edit = function(id, titulo) {
  let query = table.update({
    nombre: titulo.nombre,
    tipo_matricula: titulo.tipo_matricula,
    nivel: titulo.nivel,
    validez_fecha_inicio: titulo.validez_fecha_inicio,
    validez_fecha_fin: titulo.validez_fecha_fin
  })
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.tipo_matricula, 
    table.nivel, table.institucion, table.validez_fecha_fin, table.validez_fecha_inicio)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.delete = function(id) {
  let query = table.delete()
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.institucion)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0])
  .catch(e => {
    if (e.code == 23503) {
      return Promise.reject({ code: 400, message: "No se puede borrar el recurso. Otros recursos dependen del mismo" });
    }
    else return Promise.reject(e);
  });
}
