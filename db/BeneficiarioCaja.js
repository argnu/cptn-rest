const {
  Pool
} = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

module.exports.add = function (nuevo_beneficiario) {
  return new Promise(function (resolve, reject) {
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

      function addBeneficiarioCaja(beneficiario) {
        let query = `
          INSERT INTO beneficiarioCaja (
            dni, nombre, apellido, fechaNacimiento, vinculo, invalidez)
          VALUES($1, $2, $3, $4, $5, $6) RETURNING id
        `;
        let values = [
          nuevo_beneficiario.dni, nuevo_beneficiario.nombre,
          nuevo_beneficiario.apellido, nuevo_beneficiario.fechaNacimiento,
          nuevo_beneficiario.vinculo, nuevo_beneficiario.invalidez
        ];

        return client.query(query, values);
      }
    });
  });
}