

const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

function addProfesional(client, nuevo_profesional) {

  function addDatosBasicos(profesional) {
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
      INSERT INTO domicilio (calle, numero, localidad)
      VALUES($1, $2, $3) RETURNING id
    `;
    let values = [
      domicilio.calle, domicilio.numero, domicilio.localidad
    ];
    return client.query(query, values);
  }

  function addFormacion(formacion) {
    let query = `
      INSERT INTO formacion (titulo, tipo, fecha, institucion, profesional)
      VALUES($1, $2, $3, $4, $5)
    `;
    let values = [
      formacion.titulo, formacion.tipo, formacion.fecha,
      formacion.institucion, formacion.profesional
    ];

    return client.query(query, values)
  }

  return new Promise(function(resolve, reject) {
    Promise.all([
      addDomicilio(nuevo_profesional.domicilioReal),
      addDomicilio(nuevo_profesional.domicilioLegal)
    ])
    .then(rs => {
      nuevo_profesional.idDomicilioReal = rs[0].rows[0].id;
      nuevo_profesional.idDomicilioLegal = rs[1].rows[0].id;
      addDatosBasicos(nuevo_profesional)
        .then(r => {
          var id_profesional = r.rows[0].id;
          let proms_contactos = nuevo_profesional.contactos.map(c => {
            c.profesional = id_profesional;
            return addContacto(c);
          });

          let proms_formaciones = nuevo_profesional.formaciones.map(f => {
            f.profesional = id_profesional;
            return addFormacion(f);
          });


          Promise.all(proms_contactos)
          .then(rs => Promise.all(proms_formaciones))
          .then(rs => {
            resolve(id_profesional);
          })
        })
      })
      .catch(e => reject(e));
  });
}

module.exports.addProfesional = addProfesional;

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

      client.query('BEGIN', (err) => {
        if (err) reject(err);
        addProfesional(client, nuevo_profesional)
          .then(r => {
            let id_profesional = r;
            client.query('COMMIT', (err) => {
              if (err) console.error('Error committing transaction', err)
              done();
              resolve(id_profesional);
            });
          })
          .catch(e => rollback(e));
      });
    });
  });
}


module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let profesionales = [];
    pool.query('SELECT * FROM profesional')
    .then(r => {
      profesionales = r.rows;
      let proms = []
      for(let profesional of profesionales) {
        proms.push(getDatosProfesional(profesional));
      }
      return Promise.all(proms);
    })
    .then(rs => {
      rs.forEach((value, index) => fillDataProfesional(profesionales[index], value));
      resolve(profesionales);
    })
  });
}


function getDatosProfesional(profesional) {

  function getDomicilios(real, legal) {
    let query = 'SELECT * FROM domicilio WHERE id=$1 OR id=$2';
    let values = [ real, legal ];
    return pool.query(query, values);
  }

  function getContactos(id) {
    let query = 'SELECT * FROM contacto WHERE profesional=$1';
    let values = [ id ];
    return pool.query(query, values);
  }

  function getFormaciones(id) {
    let query = `SELECT titulo, tipo, fecha, institucion.nombre as institucion
                 FROM formacion INNER JOIN institucion ON formacion.institucion=institucion.id
                 WHERE profesional=$1`;
    let values = [ id ];
    return pool.query(query, values);
  }

  return Promise.all([
      getDomicilios(profesional.domicilioreal, profesional.domiciliolegal),
      getContactos(profesional.id),
      getFormaciones(profesional.id)
    ]);
}

function fillDataProfesional(profesional, responses) {
  for(let domicilio of responses[0].rows) {
    if (domicilio.id == profesional.domiciliolegal) profesional.domiciliolegal = domicilio;
    else if (domicilio.id == profesional.domicilioreal) profesional.domicilioreal = domicilio;
  }
  profesional.contactos = responses[1].rows;
  profesional.formaciones = responses[2].rows;
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let profesional = {};

    let query = 'SELECT * FROM profesional WHERE id=$1';
    let values = [ id ];
    pool.query(query, values)
    .then(r => {
      profesional = r.rows[0];
      return getDatosProfesional(profesional);
    })
    .then(rs => {
      fillDataProfesional(profesional, rs);
      resolve(profesional)
    })
    .catch(e => reject(e));
  });
}
