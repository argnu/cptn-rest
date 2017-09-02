const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Profesional = require('./profesional').Profesional;

const table = sql.define({
  name: 'solicitud',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'estado',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'exencionArt10',
      dataType: 'boolean',
      notNull: true,
      defaultValue: false
    },
    {
      name: 'exencionArt6',
      dataType: 'boolean',
      notNull: true,
      defaultValue: false
    },
    {
      name: 'delegacion',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'delegacion',
      columns: [ 'delegacion' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

function addSolicitud(client, solicitud) {
  let query = table.insert(
    table.fecha.value(solicitud.fecha), table.estado.value(solicitud.estado),
    table.delegacion.value(solicitud.delegacion),
    table.profesional.value(solicitud.profesional)
  ).toQuery()
  return connector.execQuery(query, client);
}

module.exports.add = function(solicitud) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {
      addSolicitud(connection.client, solicitud)
      .then(r =>
          Profesional.addProfesional(connection.client, solicitud.profesional)
            .then(r => {
              solicitud.profesional = r;
              return addSolicitud(solicitud)
                .then(r => {
                  let id_solicitud = r.rows[0].id;
                  return connector
                  .commit(connection.client)
                  .then(r => {
                    connection.done();
                    resolve(id_solicitud);
                  });
                })
            })
      )
      .catch(e => {
        connector.rollback(connection.client);
        connection.done();
        reject(e);
      });
    });
  });
}

module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let solicitudes = [];
    let query = table.select(table.star()).from(table).toQuery();
    connector.execQuery(query)
    .then(r => {
      solicitudes = r.rows;
      let proms = solicitudes.map(s => Profesional.get(s.profesional));
      Promise.all(proms)
             .then(rs => {
               rs.forEach((r, i) => {
                 solicitudes[i].profesional = r;
               });
               resolve(solicitudes);
             })
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let solicitud = {};
    let query = table.select(table.star())
                     .from(table)
                     .where(table.id.equals(id))
                     .toQuery();
    connector.execQuery(query)
    .then(r => {
      solicitud = r.rows[0];
      return Profesional.get(solicitud.profesional)
    })
    .then(r => {
      solicitud.profesional = r;
      resolve(solicitud);
    })
    .catch(e => reject(e));
  });
}
