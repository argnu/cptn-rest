const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const InstitucionTitulo = require('./InstitucionTitulo');
const Domicilio = require('./Domicilio');

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
    },
    {
      name: 'valida',
      dataType: 'boolean',
      notNull: true,
      defaultValue: true
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
  try {
    let connection;

    return connector
    .beginTransaction()
    .then(con => {
      connection = con;
      if (institucion.domicilio.localidad && institucion.domicilio.direccion 
        && institucion.domicilio.direccion.length) {
          return Domicilio.add(institucion.domicilio, connection.client)
      }
      else return Promise.resolve(null);
    })
    .then(domicilio => {
        let query = table.insert(
          table.nombre.value(institucion.nombre),
          table.cue.value(institucion.cue),
          table.domicilio.value(domicilio ? domicilio.id : null)
        )
        .returning(table.star())
        .toQuery();

        return connector.execQuery(query, connection.client);
    })
    .then(r => {
      institucion.id = r.rows[0].id;
      let proms_titulos = institucion.titulos.map(t => {
        t.institucion = institucion.id;
        return InstitucionTitulo.add(t, connection.client);
      });

      return Promise.all(proms_titulos);
    })
    .then(titulos_nuevos => {
      titulos_nuevos.forEach((tit_nuevo, i) => {
        institucion.titulos[i].id = tit_nuevo.id;
      });

      return connector.commit(connection.client)
      .then(r => {
        connection.done();
        return institucion;
      });    
    }) 
    .catch(e => {
      connector.rollback(connection.client);
      connection.done();
      console.error(e);
      return Promise.reject(e);
    });  
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
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
    table.id, table.nombre, table.cue, table.valida
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
    table.id, table.nombre, table.cue, table.valida
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
  let institucion_patch = {};
  if (institucion.cue) institucion_patch.cue = institucion.cue;
  if (institucion.nombre) institucion_patch.nombre = institucion.nombre;
  if (institucion.valida != undefined || institucion.valida != null) institucion_patch.valida = institucion.valida;

  let query = table.update(institucion_patch)
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.cue, table.valida)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}
