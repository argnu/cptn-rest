const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

let create_table_profesional = `CREATE TABLE profesional(
     id SERIAL PRIMARY KEY,
     dni VARCHAR(10) NOT NULL,
     nombre VARCHAR(45) NOT NULL,
     apellido VARCHAR(45) NOT NULL,
     fechaNacimiento DATE NOT NULL,
     sexo CHAR(1),
     nacionalidad VARCHAR(45),
     estadoCivil VARCHAR(45),
     observaciones TEXT,
     cuit VARCHAR(45)
   )`;

let drop_table_profesional = 'DROP TABLE profesional';

pool.query(drop_table_profesional, (err, res) => {
  pool.query(create_table_profesional, (err, res) => {
    pool.end();
    console.log('Finalizado!');
  });
});
