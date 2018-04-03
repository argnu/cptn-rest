const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const TipoNivelTitulo = require('./tipos/TipoNivelTitulo');
const TituloIncumbencia = require('./TituloIncumbencia');

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
  let titulos;
  let query = table.select(select).from(from)
  .where(table.institucion.equals(institucion));

  return connector.execQuery(query.toQuery())
  .then(r => {
    titulos = r.rows.map(row => dot.object(row));
    return Promise.all(titulos.map(t => TituloIncumbencia.getByTitulo(t.id)));
  })
  .then(list_incumbencias => {
    list_incumbencias.forEach((incumbencias, i) => {
      titulos[i].incumbencias = incumbencias;
    });

    return titulos;
  })
}

module.exports.get = function(id) {
  let query = table.select(select).from(from)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}

module.exports.add = function(titulo, client) {
  try {
    let titulo_nuevo;
    let query = table.insert(
      table.nombre.value(titulo.nombre),
      table.tipo_matricula.value(titulo.tipo_matricula),
      table.nivel.value(titulo.nivel),
      table.institucion.value(titulo.institucion)
    )
    .returning(table.id, table.nombre, table.tipo_matricula,
      table.nivel, table.institucion)
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => {
      titulo_nuevo = r.rows[0];
      return Promise.all(titulo.incumbencias.map(i => TituloIncumbencia.add({
        titulo: titulo_nuevo.id,
        incumbencia: i
      }, client)));
    })
    .then(incumbencias => {
      titulo_nuevo.incumbencias = incumbencias;
      return titulo_nuevo;
    })
    .catch(e => {
      console.error(e);
      return Promise.reject(e);
    })  
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
}

module.exports.edit = function(id, titulo) {
  try {
    let titulo_edit;
    let query = table.update({
      nombre: titulo.nombre,
      tipo_matricula: titulo.tipo_matricula,
      nivel: titulo.nivel
    })
    .where(table.id.equals(id))
    .returning(table.id, table.nombre, table.tipo_matricula,
      table.nivel, table.institucion)
    .toQuery();

    return connector.execQuery(query)
    .then(r => {
        return connector.execQuery(
          TituloIncumbencia.table.delete().where(TituloIncumbencia.table.titulo.equals(id)).toQuery()
        );
    })
    .then(r => {
      return Promise.all(titulo.incumbencias.map(i => TituloIncumbencia.add({
        titulo: id,
        incumbencia: i.id ? i.id : i
      })));
    })
    .then(r => titulo)
    .catch(e => {
      console.error(e);
      return Promise.reject(e);
    });
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
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
      return Promise.reject({ code: 409, message: "No se puede borrar el recurso. Otros recursos dependen del mismo" });
    }
    else return Promise.reject(e);
  });
}
