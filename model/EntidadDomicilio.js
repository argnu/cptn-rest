const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');
const Domicilio = require(`./Domicilio`);

const table = sql.define({
  name: 'entidad_domicilio',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'tipo',
      dataType: 'varchar(20)'
    },
    {
      name: 'entidad',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'domicilio',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'entidad' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'domicilio',
      columns: [ 'domicilio' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

module.exports.add = function(data, client) {
    return Domicilio.add(data.domicilio)
    .then(domicilio => {
      let query = table.insert(
        table.tipo.value(data.tipo), 
        table.entidad.value(data.entidad),
        table.domicilio.value(domicilio.id)
      )
      .returning(table.star())
      .toQuery();
    
      return connector.execQuery(query, client)
             .then(r => r.rows[0]);
    })
}

module.exports.getByEntidad = function(id_entidad) {
  let domicilios;
  let query = table.select(table.star())
                   .where(table.entidad.equals(id_entidad))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => {
            domicilios = r.rows;
            return Promise.all(domicilios.map(d => Domicilio.get(d.domicilio)));
         })
         .then(ds => {
            ds.forEach((d, i) => {
              domicilios[i].domicilio = d;
            });
            return domicilios;
         })
}

module.exports.delete = function(id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}

module.exports.deleteByEntidad = function(id_entidad, client) {
  let query = table.delete()
                   .where(table.entidad.equals(id_entidad))
                   .returning(table.star())
                   .toQuery();

  return connector.execQuery(query, client)
  .then(r => {
    if (r.rows.length)
      return Promise.all(r.rows.map(d => Domicilio.delete(d.domicilio, client)));
    else return Promise.resolve();
  })
  .then(r => id_entidad);
}