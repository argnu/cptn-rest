const connector = require('../db/connector');
const utils = require('../utils');
const sql = require('node-sql-2');
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

function filter(query, params) {
  if (params.filtros) {
    if (params.filtros.nombre) query.where(table.nombre.ilike(`%${params.filtros.nombre}%`));
    if (params.filtros.cue) query.where(table.cue.ilike(`%${params.filtros.cue}%`));
  }
}

module.exports.getAll = function(params) {
  let instituciones = [];
  let domicilios = [];

  let query = table.select(
    table.id, table.nombre, table.cue, table.valida
  );

  filter(query, params);

  if (params.sort) {
    if (params.sort.nombre) query.order(table.nombre[params.sort.nombre]);
    else if (params.sort.cue) query.order(table.cue[params.sort.cue]);
  }

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    instituciones = r.rows;
    return Promise.all(instituciones.map(i => Domicilio.get(i.domicilio)))
  })
  .then(domicilios => {
    instituciones.forEach((institucion, index) => {
      institucion.domicilio = domicilios[index];
    })
    return Promise.all(instituciones.map(i => InstitucionTitulo.getByInstitucion(i.id)))
  })
  .then(titulos => {
    instituciones.forEach((institucion, index) => {
      institucion.titulos = titulos[index];
    })

    return utils.getTotalQuery(
      table,
      table,
      (query) => filter(query, params)
    );
  })
  .then(totalQuery => ({ resultados: instituciones, totalQuery }))
}

module.exports.get = function(id) {
  let institucion;

  let query = table.select(
    table.id, table.nombre, table.cue, table.valida, table.domicilio
  ).from(
    table
  ).where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
    institucion = r.rows[0];
    return Domicilio.get(institucion.domicilio);
  })
  .then(domicilio => {
    institucion.domicilio = domicilio;
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

module.exports.edit = function(id, institucion) {
  let connection;
  let titulos_nuevos = institucion.titulos.filter(t => !t.id);
  let titulos_existentes = institucion.titulos.filter(t => !!t.id);  

  return connector.beginTransaction()
  .then(con => {
    connection = con;
    if (!institucion.domicilio ||
        !(institucion.domicilio.localidad && institucion.domicilio.direccion && institucion.domicilio.direccion.length))
        return Promise.resolve(null);
    else if (institucion.domicilio.id)
        return Domicilio.edit(institucion.domicilio.id, institucion.domicilio, connection.client);
    else
        return Domicilio.add(institucion.domicilio, connection.client);
  })
  .then(domicilio => {
    let institucion_mod = {
      cue: institucion.cue,
      nombre: institucion.nombre,
      valida: institucion.valida,
      domicilio: domicilio ? domicilio.id : null
    };

    let query = table.update(institucion_mod)
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query, connection.client)
  })
  .then(r => {
    return connector.execQuery(
      InstitucionTitulo.table.delete().where(
        InstitucionTitulo.table.institucion.equals(id)
        .and(InstitucionTitulo.table.id.notIn(titulos_existentes.map(t => t.id)))
      ).toQuery(), connection.client);
  })
  .then(r => {
    let proms = [];

    titulos_nuevos.forEach(t => {
      t.institucion = id;
      proms.push(InstitucionTitulo.add(t, connection.client));
    });

    titulos_existentes.forEach(t => proms.push(InstitucionTitulo.edit(t.id, t, connection.client)));

    return Promise.all(proms);    
  })
  .then(r => {
    return connector.commit(connection.client)
    .then(r => {
      connection.done();
      return institucion;
    });
  })
  .catch(e => {
    connector.rollback(connection.client);
    connection.done();
    return Promise.reject(e);
  });  
}
