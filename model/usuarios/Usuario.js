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
const UsuarioRol = require('./UsuarioRol');

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
    usuarios = r.rows;
    return Promise.all(usuarios.map(u => getRoles(u.id)));
  })
  .then(roles_list => {
    roles_list.forEach((roles, index) => {
      usuarios[index].roles = roles;
    });

    return utils.getTotalQuery(
      table, table,
      (query) => filter(query, params)
    )
  })
  .then(totalQuery => ({ resultados: usuarios, totalQuery }))
}

module.exports.get = function(id) {
  let usuario;
  let query = table.select(table.star())
  .from(table)
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => { 
    usuario = r.rows[0];
    return getRoles(usuario.id);
  })
  .then(roles => {
    usuario.roles = roles;
    return usuario;
  })
}

function getRoles(id) {
  let table = UsuarioRol.table;
  let query = table.select(table.rol)
  .where(table.usuario.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.map(e => e.rol));
}

module.exports.add = function(usuario) {
  let conexion;

  return connector.beginTransaction()
  .then(con => {
    conexion = con;
    let query = table.insert(
      table.username.value(usuario.username),
      table.nombre.value(usuario.nombre),
      table.apellido.value(usuario.apellido),
      table.email.value(usuario.email),
      table.hash_password.value(bcrypt.hashSync(usuario.password, 10))
    )
    .returning(table.id, table.nombre, table.apellido, table.email)
    .toQuery();
    return connector.execQuery(query, conexion.client)
  })
  .then(r => {
    usuario.id = r.rows[0].id;
    return Promise.all(usuario.roles.map(rol => addRol(usuario.id, rol, conexion.client)));
  })
  .then(roles => {
    usuario.roles = roles;
    return Promise.all(usuario.delegaciones.map(d => addDelegacion(usuario.id, d, conexion.client)))
  })
  .then(delegaciones => {
    usuario.delegaciones = delegaciones;
    return connector.commit(conexion.client)
    .then(r => {
        conexion.done();
        return usuario;
    });
  })
  .catch(e => {
      connector.rollback(conexion.client);
      conexion.done();
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

  let query = table.update(usuario_patch)
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.apellido, table.email, table.activo)
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0])
  .catch(e => {
      console.error(e);
      return Promise.reject(e);
  });
}

module.exports.edit = function(id, usuario) {
  let conexion;

  if (usuario.password) {
    usuario.hash_password = bcrypt.hashSync(usuario.password, 10);
    delete(usuario.password);
  }

  return connector.beginTransaction()
  .then(con => {
    conexion = con;
    return Promise.all([
      connector.execQuery(
        UsuarioDelegacion.table.delete().where(
          UsuarioDelegacion.table.usuario.equals(id)
        ).toQuery(), 
        conexion.client
      ),

      connector.execQuery(
        UsuarioRol.table.delete().where(
          UsuarioRol.table.usuario.equals(id)
        ).toQuery(), 
        conexion.client
      )
    ]);
  })
  .then(r => Promise.all(usuario.roles.map(rol => addRol(id, rol, conexion.client))))
  .then(r => Promise.all(usuario.delegaciones.map(d => addDelegacion(id, d, conexion.client))))
  .then(() => {
    delete(usuario.delegaciones);
    delete(usuario.roles);
    let query = table.update(usuario)
    .where(table.id.equals(id))
    .returning(table.id, table.nombre, table.apellido, table.email, table.activo)
    .toQuery();

    return connector.execQuery(query, conexion.client)
  })
  .then(usuario => {
    return connector.commit(conexion.client)
    .then(r => {
      conexion.done();
      return usuario;
    });
  })
  .catch(e => {
    connector.rollback(conexion.client);
    conexion.done();
    return Promise.reject(e);
  });  
}


module.exports.auth = function(usuario) {
  let query = table.select(
    table.id,
    table.username,
    table.hash_password,
    table.nombre,
    table.apellido,
    table.email,
    table.activo
  )
  .from(table)
  .where(table.username.equals(usuario.username))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
      if (r.rows.length == 1) {
        let usuario_bd =r.rows[0];
        if (bcrypt.compareSync(usuario.password, usuario_bd.hash_password) && usuario_bd.activo) {
          return getRoles(usuario_bd.id)
          .then(roles => {
            usuario_bd.token = jwt.sign({ id: usuario_bd.id, roles }, config.secret);
            usuario_bd.rules = roles.map(rol => ABILITIES[rol].rules).reduce((a,b) => [...a, ...b], []);
            delete(usuario_bd.hash_password);
            return usuario_bd;
          })
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

function addRol(id, rol, client) {
  try {
    let table = UsuarioRol.table;
    let query = table.insert(
      table.usuario.value(id),
      table.rol.value(rol)
    )
    .returning(table.rol)
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0].rol)
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