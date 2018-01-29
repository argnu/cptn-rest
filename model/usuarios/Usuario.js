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
  columns: [{
      name: 'id',
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
    }
  ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table);
  if (params.sort && params.sort.valor) query.order(table.valor[params.sort.valor]);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows);
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
  let query = table.insert(
          table.id.value(usuario.id),
          table.nombre.value(usuario.nombre),
          table.apellido.value(usuario.apellido),
          table.email.value(usuario.email),
          table.hash_password.value(bcrypt.hashSync(usuario.password, 10))
        )
        .returning(table.id, table.nombre, table.apellido, table.email)
       .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

module.exports.auth = function(usuario) {
  let query = table.select(
          table.id, table.hash_password,
          table.nombre, table.apellido,
          table.email
        )
       .from(table)
       .where(table.id.equals(usuario.id))
       .toQuery();

  return connector.execQuery(query)
  .then(r => {
      if (r.rows.length == 1) {
        let usuario_bd =r.rows[0];
        if (bcrypt.compareSync(usuario.password, usuario_bd.hash_password)) {
          usuario_bd.token = jwt.sign({ id: usuario_bd.id, admin: usuario_bd.admin }, config.secret);
          delete(usuario_bd.hash_password);
          return usuario_bd
        }
        else return null;
      }
      else return null;
  });
}

module.exports.getDelegaciones = function(id) {
  let table = Delegacion.table;
  let query = table.select(
    table.id, table.nombre
  )
  .from(table.join(UsuarioDelegacion.table).on(table.id.equals(UsuarioDelegacion.table.delegacion)))
  .where(UsuarioDelegacion.table.usuario.equals(id))
  .toQuery();

  return connector.execQuery(query)
    .then(r => r.rows);  
}

module.exports.addDelegacion = function(id, delegacion) {
  let table = UsuarioDelegacion.table;
  let query = table.insert(
    table.usuario.value(id),
    table.delegacion.value(delegacion)
  )
  .returning(table.id, table.usuario, table.delegacion)
  .toQuery();

  return connector.execQuery(query)
    .then(r => r.rows[0]);    
}