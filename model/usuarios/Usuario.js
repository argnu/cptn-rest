const ABILITIES = require('../../auth/roles')
const utils = require('../../utils');
const config = require(`../../config.private`);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');

const Delegacion = require(`../Delegacion`);
const UsuarioDelegacion = require('./UsuarioDelegacion');

 const table = sql.define({
  name: 'usuario',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'username',
      dataType: 'varchar(45)',
      unique: true
    },
    {
      name: 'rol',
      dataType: 'varchar(100)',
      notNull: true,
      defaultValue: 'usuario_cptn'
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'apellido',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'email',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'hash_password',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'activo',
      dataType: 'boolean',
      notNull: true,
      defaultValue: true
    }
  ]
});

module.exports.table = table;

function filter(query, params) {
  if (params.filtros) {
    if (params.filtros.nombre) query.where(table.nombre.ilike(`%${params.filtros.nombre}%`));
    if (params.filtros.username) query.where(table.username.ilike(`%${params.filtros.username}%`));
    if (params.filtros.apellido) query.where(table.apellido.ilike(`%${params.filtros.apellido}%`));
    if (params.filtros.email) query.where(table.email.ilike(`%${params.filtros.email}%`));
  }
}

module.exports.getAll = function(params) {
  let usuarios;
  let query = table.select(
    table.id,
    table.username,
    table.nombre,
    table.apellido,
    table.email,
    table.activo
  ).from(table);

  filter(query, params);

  if (params.sort) {
    if (params.sort.nombre) query.order(table.nombre[params.sort.nombre]);
    else if (params.sort.username) query.order(table.username[params.sort.username]);
    else if (params.sort.apellido) query.order(table.apellido[params.sort.apellido]);
    else if (params.sort.email) query.order(table.email[params.sort.email]);
  }

  if (params.limit) query.limit(+params.limit);
  if (params.limit && params.offset) query.offset(+params.offset);

  return connector.execQuery(query.toQuery())
  .then(r => {
    usuarios = r.rows
    return utils.getTotalQuery(
      table, table,
      (query) => filter(query, params)
    )
  })
  .then(totalQuery => ({ resultados: usuarios, totalQuery }))
}

module.exports.get = function(id) {
  let query = table.select(table.star())
       .from(table)
       .where(table.id.equals(id))
       .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.add = function(usuario) {
  let connection;
  return connector.beginTransaction()
  .then(con => {
    connection = con;
    let query = table.insert(
      table.username.value(usuario.username),
      table.nombre.value(usuario.nombre),
      table.apellido.value(usuario.apellido),
      table.email.value(usuario.email),
      table.hash_password.value(bcrypt.hashSync(usuario.password, 10))
    )
    .returning(table.id, table.nombre, table.apellido, table.email)
    .toQuery();
    return connector.execQuery(query, connection.client)
  })
  .then(r => {
    let usuario_nuevo = r.rows[0];
    usuario.id = usuario_nuevo.id;
    let proms = usuario.delegaciones.map(d => addDelegacion(usuario_nuevo.id, d, connection.client));
    return Promise.all(proms);
  })
  .then(delegaciones => {
    usuario.delegaciones = delegaciones;
    return connector.commit(connection.client)
    .then(r => {
        connection.done();
        return usuario;
    });
  })
  .catch(e => {
      connector.rollback(connection.client);
      connection.done();
      console.error(e);
      return Promise.reject(e);
  });
}


module.exports.patch = function(id, usuario) {
  let usuario_patch = {};

  if (usuario.password) {
    usuario_patch.hash_password = bcrypt.hashSync(usuario.password, 10);
  }

  if (usuario.nombre) usuario_patch.nombre = usuario.nombre;
  if (usuario.apellido) usuario_patch.apellido = usuario.apellido;
  if (usuario.email) usuario_patch.email = usuario.email;
  if (usuario.activo != null || usuario.activo != undefined) usuario_patch.activo = usuario.activo;

  console.log(usuario_patch)

  let query = table.update(usuario_patch)
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.apellido, table.email, table.activo, table.rol)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0])
  .catch(e => {
      console.error(e);
      return Promise.reject(e);
  });
}

module.exports.edit = function(id, usuario) {
  let connection;

  if (usuario.password) {
    usuario.hash_password = bcrypt.hashSync(usuario.password, 10);
    delete(usuario.password);
  }

  return connector.beginTransaction()
  .then(con => {
    connection = con;
    return connector.execQuery(
      UsuarioDelegacion.table.delete().where(
        UsuarioDelegacion.table.usuario.equals(id)
      ).toQuery(), connection.client);
  })
  .then(r => {
    return Promise.all(usuario.delegaciones.map(d => addDelegacion(id, d, connection.client)))
  })
  .then(delegaciones => {
    delete(usuario.delegaciones);
    let query = table.update(usuario)
    .where(table.id.equals(id))
    .returning(table.id, table.nombre, table.apellido, table.email, table.activo, table.rol)
    .toQuery();

    return connector.execQuery(query, connection.client)
  })
  .then(usuario => {
    return connector.commit(connection.client)
    .then(r => {
      connection.done();
      return usuario;
    });
  })
  .catch(e => {
    connector.rollback(connection.client);
    connection.done();
    return Promise.reject(e);
  });  
}


module.exports.auth = function(usuario) {
  let query = table.select(
          [table.id,
          table.username,
          table.hash_password,
          table.nombre,
          table.apellido,
          table.email,
          table.rol,
          table.activo
        ])
       .from(table)
       .where(table.username.equals(usuario.username))
       .toQuery();

  return connector.execQuery(query)
  .then(r => {
      if (r.rows.length == 1) {
        let usuario_bd =r.rows[0];
        if (bcrypt.compareSync(usuario.password, usuario_bd.hash_password) && usuario_bd.activo) {
          usuario_bd.token = jwt.sign({ id: usuario_bd.id, rol: usuario_bd.rol }, config.secret);
          usuario_bd.rules = ABILITIES[usuario_bd.rol].rules;
          delete(usuario_bd.hash_password);
          return usuario_bd;
        }
        else return false;
      }
      else return false;
  })
  .catch(e => {
      console.error(e);
      return Promise.reject(e);
  });
}

module.exports.getDelegaciones = function(id) {
  let table = Delegacion.table;
  let query = table.select(table.id)
  .from(table.join(UsuarioDelegacion.table).on(table.id.equals(UsuarioDelegacion.table.delegacion)))
  .where(UsuarioDelegacion.table.usuario.equals(id))
  .toQuery();

  return connector.execQuery(query)
    .then(r => Promise.all(r.rows.map(row => Delegacion.get(row.id))));
}

function addDelegacion(id, delegacion, client) {
  try {
    let table = UsuarioDelegacion.table;
    let query = table.insert(
      table.usuario.value(id),
      table.delegacion.value(delegacion)
    )
    .returning(table.id, table.usuario, table.delegacion)
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0])
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

module.exports.addDelegacion = addDelegacion;

module.exports.borrarDelegacion = function(id_delegacion) {
  try {
    let table = UsuarioDelegacion.table;
    let query = table.delete()
    .where(table.delegacion.equals(id_delegacion))
    .returning(table.id, table.usuario, table.delegacion)
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows[0])
    .catch(e => {
      console.error(e);
      return Promise.reject(e);
    })
  }
  catch(e) {
    console.error(e);
    return Promise.reject(e);
  }
};