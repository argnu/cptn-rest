const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Localidad = require('./geograficos/Localidad');
const Departamento = require('./geograficos/Departamento');
const Provincia = require('./geograficos/Provincia');
const Pais = require('./geograficos/Pais');

const table = sql.define({
  name: 'domicilio',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'calle',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'numero',
      dataType: 'int'
    },
    {
      name: 'localidad',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
    table: 'localidad',
    columns: [ 'localidad' ],
    refColumns: [ 'id' ]
  }
});


module.exports.table = table;

module.exports.add = function(domicilio, client) {
  if (domicilio && domicilio.localidad && domicilio.calle && domicilio.calle.length) {
    let query = table.insert(
      table.calle.value(domicilio.calle),
      table.numero.value(domicilio.numero),
      table.localidad.value(domicilio.localidad)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
  }
  else return Promise.resolve(null);
}

module.exports.get = function(id) {
  let query = table.select(
                      table.id, table.calle, table.numero,
                      Localidad.table.nombre.as('localidad'),
                      Departamento.table.nombre.as('departamento'),
                      Provincia.table.nombre.as('provincia'),
                      Pais.table.nombre.as('pais')
                    )
                   .from(
                     table.join(Localidad.table).on(table.localidad.equals(Localidad.table.id))
                     .join(Departamento.table).on(Localidad.table.departamento.equals(Departamento.table.id))
                     .join(Provincia.table).on(Departamento.table.provincia.equals(Provincia.table.id))
                     .join(Pais.table).on(Provincia.table.pais.equals(Pais.table.id))
                   )
                   .where(table.id.equals(id))
                   .toQuery();
  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

module.exports.edit = function(id, domicilio, client) {
  let query = table.update({
    calle: domicilio.calle,
    localidad: domicilio.localidad,
    numero: domicilio.numero
  })
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query).then(r => ({ id }));
}

module.exports.delete = function(id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}