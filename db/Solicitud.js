const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);
const Profesional = require('./profesional').Profesional;


module.exports.add = function(nueva_solicitud) {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) reject(err);

      function rollback(e) {
        client.query('ROLLBACK', (err) => {
          if (err) {
            console.error('Error rolling back', err);
            reject(err);
          }
          done();
          reject(e);
        });
      }

      function addSolicitud(solicitud) {
        let query = `
          INSERT INTO solicitud (fecha, estado, delegacion, profesional)
          VALUES($1, 'pendiente', $2, $3) RETURNING id
        `;
        let values = [
          solicitud.fecha, solicitud.delegacion, solicitud.profesional
        ];

        return client.query(query, values)
      }

      client.query('BEGIN', (err) => {
        if (err) reject(err);
        Profesional.addProfesional(client, nueva_solicitud.profesional)
          .then(r => {
            nueva_solicitud.profesional = r;
            addSolicitud(nueva_solicitud)
              .then(r => {
                let id_solicitud = r.rows[0].id;
                client.query('COMMIT', (err) => {
                  if (err) console.error('Error committing transaction', err)
                  done();
                  resolve(id_solicitud);
                });
              })
          })
          .catch(e => rollback(e));
      });
    });
  });
}


module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let solicitudes = [];
    pool.query('SELECT * FROM solicitud')
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
    let query = 'SELECT * FROM solicitud WHERE id=$1';
    let values = [ id ];
    pool.query(query, values)
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
