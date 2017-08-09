

const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

module.exports.add = function(nuevo_profesional) {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {

      if (err) reject(err);

      function rollback(e) {
        console.error(e);
        client.query('ROLLBACK', (err) => {
          if (err) {
            console.error('Error rolling back', err);
            reject(err);
          }
          done();
          reject(e);
        });
      }

      function addProfesional(profesional) {
        let query = `
          INSERT INTO profesional (
            dni, nombre, apellido, fechaNacimiento, sexo,
            nacionalidad, estadoCivil, observaciones, cuit,
            domicilioReal, domicilioLegal
          )
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
        `;
        let values = [
          nuevo_profesional.dni, nuevo_profesional.nombre,
          nuevo_profesional.apellido, nuevo_profesional.fechaNacimiento,
          nuevo_profesional.sexo, nuevo_profesional.nacionalidad,
          nuevo_profesional.estadoCivil, nuevo_profesional.observaciones,
          nuevo_profesional.cuit, nuevo_profesional.idDomicilioReal, nuevo_profesional.idDomicilioLegal
        ];

        return client.query(query, values);
      }

      function addContacto(contacto) {
        let query = `
          INSERT INTO contacto (tipo, dato, profesional)
          VALUES($1, $2, $3)
        `;
        let values = [ contacto.tipo, contacto.dato, contacto.profesional ];
        return client.query(query, values);
      }

      function addDomicilio(domicilio) {
        let query = `
          INSERT INTO domicilio (calle, numero, codpostal, localidad)
          VALUES($1, $2, $3, $4) RETURNING id
        `;
        let values = [
          domicilio.calle, domicilio.numero,
          domicilio.codpostal, domicilio.localidad
        ];
        return client.query(query, values);
      }


      client.query('BEGIN', (err) => {
        if (err) reject(err);

        Promise.all([
          addDomicilio(nuevo_profesional.domicilioReal),
          addDomicilio(nuevo_profesional.domicilioLegal)
        ])
        .then(rs => {
          nuevo_profesional.idDomicilioReal = rs[0].rows[0].id;
          nuevo_profesional.idDomicilioLegal = rs[1].rows[0].id;
          addProfesional(nuevo_profesional)
            .then(r => {
              var id_profesional = r.rows[0].id;
              let proms_contactos = nuevo_profesional.contactos.map(c => {
                c.profesional = id_profesional;
                return addContacto(c);
              });
              Promise.all(proms_contactos)
              .then(rs => {
                  client.query('COMMIT', (err) => {
                    if (err) console.error('Error committing transaction', err)
                    done();
                    resolve(id_profesional);
                  });
              })
              .catch(e => rollback(e));
            })
            .catch(e => rollback(e));
        })
        .catch(e => rollback(e));
      });
    });
  });
}


module.exports.getAll = function() {
  return pool.query('SELECT * FROM profesional');
}


module.exports.get = function(id) {
  let query = 'SELECT * FROM profesional WHERE id=$1';
  let values = [ id ]
  return pool.query(query, values);
}
