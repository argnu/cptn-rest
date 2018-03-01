const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const InstitucionTitulo = require('./InstitucionTitulo');

const table = sql.define({
  name: 'institucion',
  columns: [{
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
      name: 'cue',
      dataType: 'varchar(45)'
    },
    {
      name: 'domicilio',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'domicilio',
      columns: ['domicilio'],
      refColumns: ['id']
    }
  ]
});

module.exports.add = function(institucion, client) {
  if (institucion && institucion.nombre) {
    let query = table.insert(
      table.nombre.value(domicilio.nombre)
    )
    .returning(table.star())
    .toQuery();
    
    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
  }
  else Promise.resolve();
}

module.exports.table = table;


function getTotal(params) {
  let query;
  if (!params) query = table.select(table.count().as('total'));
  else {
    query = table.select(table.count(table.id).as('total'));

    if (params.filter) {
      if (params.filter.nombre) query.where(table.nombre.ilike(`%${params.filter.nombre}%`));
      if (params.filter.cue) query.where(table.cue.ilike(`%${params.filter.cue}%`)); 
    }
  }

  return connector.execQuery(query.toQuery())
  .then(r => +r.rows[0].total);
}


module.exports.getAll = function(params) {
  let instituciones = [];

  let query = table.select(
    table.id, table.nombre, table.cue
  );

  if (params.filter) {
    if (params.filter.nombre) query.where(table.nombre.ilike(`%${params.filter.nombre}%`));
    if (params.filter.cue) query.where(table.cue.ilike(`%${params.filter.cue}%`));
  }

  if (params.sort) {
    if (params.sort.nombre) query.order(table.nombre[params.sort.nombre]);
    else if (params.sort.cue) query.order(table.cue[params.sort.cue]);
  }
  
  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);  

  return connector.execQuery(query.toQuery())
  .then(r => {
    instituciones = r.rows;
    return Promise.all(instituciones.map(i => InstitucionTitulo.getByInstitucion(i.id)))
  })
  .then(titulos => {
    instituciones.forEach((institucion, index) => {
      institucion.titulos = titulos[index];
    })    
    return Promise.all([ getTotal(), getTotal(params) ]);
  })
  .then(([total, totalQuery]) => ({ resultados: instituciones, total, totalQuery }))
}

module.exports.get = function(id) {
  let institucion;

  let query = table.select(
    table.id, table.nombre, table.cue
  ).from(
    table
  ).where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    institucion = r.rows[0];
    return InstitucionTitulo.getByInstitucion(id);
  })
  .then(titulos => {
    institucion.titulos = titulos;
    return institucion;
  })
}

module.exports.patch = function(id, institucion) {
  let query = table.update(institucion)
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.cue)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}
