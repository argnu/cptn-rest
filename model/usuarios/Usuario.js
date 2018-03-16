const config = require(`../../config.private`);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connector = require(`../../db/connector`);
const sql = require('sql');
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
      primaryKey: true
    },
    {
      name: 'admin',
      dataType: 'boolean',
      notNull: true,
      defaultValue: false
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

function getTotal(params) {
  let query;
  if (!params) query = table.select(table.count().as('total'));
  else {
    query = table.select(table.count(table.id).as('total'));

    if (params.filter) {
      if (params.filter.nombre) query.where(table.nombre.ilike(`%${params.filter.nombre}%`));
      if (params.filter.username) query.where(table.username.ilike(`%${params.filter.username}%`));
      if (params.filter.apellido) query.where(table.apellido.ilike(`%${params.filter.apellido}%`));
      if (params.filter.email) query.where(table.email.ilike(`%${params.filter.email}%`));
    }
  }

  return connector.execQuery(query.toQuery())
  .then(r => +r.rows[0].total);
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

  
  if (params.filter) {
    if (params.filter.nombre) query.where(table.nombre.ilike(`%${params.filter.nombre}%`));
    if (params.filter.username) query.where(table.username.ilike(`%${params.filter.username}%`));
    if (params.filter.apellido) query.where(table.apellido.ilike(`%${params.filter.apellido}%`));
    if (params.filter.email) query.where(table.email.ilike(`%${params.filter.email}%`));
  }

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
    return Promise.all([ getTotal(), getTotal(params) ]);
  })
  .then(([total, totalQuery]) => ({ resultados: usuarios, total, totalQuery }))
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
      table.id.value(usuario.id),
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
  if (usuario.password) { 
    usuario.hash_password = bcrypt.hashSync(usuario.password, 10);
    delete(usuario.password);
  }

  let query = table.update(usuario)
  .where(table.id.equals(id))
  .returning(table.id, table.nombre, table.apellido, table.email, table.activo, table.admin)
  .toQuery(); 
    
  return connector.execQuery(query)
  .then(r => r.rows[0])
  .catch(e => {
      console.error(e);
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
          table.admin,
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
          usuario_bd.token = jwt.sign({ id: usuario_bd.id }, config.secret);
          delete(usuario_bd.hash_password);
          return usuario_bd
        }
        else return Promise.reject({ code: 403, msg: 'Datos de usuario inválidos' });
      }
      else return Promise.reject({ code: 403, msg: 'Datos de usuario inválidos' });
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
    if (typeof delegacion == 'object' && delegacion.id) delegacion = delegacion.id;

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