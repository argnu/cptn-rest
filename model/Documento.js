const dot = require('dot-object');
const connector = require('../db/connector');
const utils = require('../utils');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const TipoDocumento = require('./tipos/TipoDocumento');

 const table = sql.define({
  name: 'documento',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'archivo',
      dataType: 'varchar(100)'
    },
    {
      name: 'created_by',
      dataType: 'int',
    },
    {
      name: 'updated_by',
      dataType: 'int',
    },
    {
      name: 'created_at',
      dataType: 'timestamptz',
      defaultValue: 'current_date'
    },
    {
      name: 'updated_at',
      dataType: 'timestamptz',
      defaultValue: 'current_date'
    }      
  ],

  foreignKeys: [
      {
        table: 't_documento',
        columns: ['tipo'],
        refColumns: ['id']
      },
      {
        table: 'usuario',
        columns: ['created_by'],
        refColumns: ['id']
      },
      {
        table: 'usuario',
        columns: ['updated_by'],
        refColumns: ['id']
      }      
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.numero,
  table.archivo,
  table.created_by,
  table.updated_by,
  table.created_at,
  table.updated_at,
  table.fecha.cast('varchar(10)'),
  TipoDocumento.table.id.as('tipo.id'),
  TipoDocumento.table.valor.as('tipo.valor')
]
const from = table.join(TipoDocumento.table).on(table.tipo.equals(TipoDocumento.table.id));

function filter(query, params) {
  if (params.numero) query.where(table.numero.equals(params.numero));
  if (params.tipo) query.where(table.tipo.equals(params.tipo));
  if (params.fecha) query.where(table.fecha.equals(params.fecha));

  if (params.filtros) {
    if (params.filtros.numero) query.where(table.numero.cast('text').ilike(`%${params.filtros.numero}%`));
    if (params.filtros['fecha.desde']) query.where(table.fecha.gte(params.filtros['fecha.desde']));
    if (params.filtros['fecha.hasta']) query.where(table.fecha.lte(params.filtros['fecha.hasta']));
  }
}

module.exports.getAll = function(params) {
  let query = table.select(select).from(from);

  filter(query, params);

  if (params.sort) {
    if (params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
    if (params.sort.numero) query.order(table.numero[params.sort.numero]);
    if (params.sort.tipo) query.order(TipoDocumento.table.valor[params.sort.tipo]);
  }

  return Promise.all([
    connector.execQuery(query.toQuery()),
    utils.getTotalQuery(table, from, (query) => filter(query, params))
  ])
  .then(([r, totalQuery]) => ({ resultados: r.rows.map(row => dot.object(row)), totalQuery }));
}

module.exports.get = function(id) {
  let query = table.select(select)
  .from(from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}

module.exports.getArchivo = function(id) {
  let query = table.select(table.archivo)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => (r.rows[0].archivo || null));
}

module.exports.add = function(documento, client) {
  try {
    let query = table.insert(
      table.numero.value(documento.numero),
      table.fecha.value(documento.fecha),
      table.tipo.value(documento.tipo),
      table.archivo.value(documento.archivo),
      table.created_by.value(documento.created_by),
      table.updated_by.value(documento.created_by)
    )
    .returning(table.id, table.numero, table.tipo, table.fecha)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
  }
  catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}

module.exports.edit = function(id, documento) {
  try {
    documento.updated_by = documento.updated_by;
    documento.updated_at = new Date();

    let query = table.update(documento)
    .where(table.id.equals(id))
    .returning(table.id, table.numero, table.tipo, table.fecha)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0]);
  }
  catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
}

module.exports.delete = function(id) {
  let query = table.delete()
  .where(table.id.equals(id))
  .returning(table.id, table.numero, table.tipo, table.fecha)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0])
  .catch(e => {
    if (e.code == 23503) {
      return Promise.reject({ http_code: 409, mensaje: "No se puede borrar el recurso. Otros recursos dependen del mismo" });
    }
    else return Promise.reject(e);    
  })  
}