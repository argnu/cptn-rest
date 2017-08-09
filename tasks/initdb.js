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
     cuit VARCHAR(45),
     domicilioreal INT references domicilio(id),
     domiciliolegal INT references domicilio(id),
     condafip INT references condafip(id)
   )`;

pool.query('DROP TABLE profesional', (err, res) => {
  pool.query(create_table_profesional, (err, res) => {
    console.info(`Tabla "profesional" creada`);
  });
});

let create_table_contacto = `CREATE TABLE contacto(
     id SERIAL PRIMARY KEY,
     tipo VARCHAR(45) NOT NULL,
     dato VARCHAR(45) NOT NULL,
     profesional INT references profesional(id)
   )`;

pool.query('DROP TABLE contacto', (err, res) => {
  pool.query(create_table_contacto, (err, res) => {
    console.info(`Tabla "contacto" creada`);
  });
});

let create_table_domicilio = `CREATE TABLE domicilio(
     id SERIAL PRIMARY KEY,
     calle VARCHAR(45) NOT NULL,
     numero INT NOT NULL,
     codpostal INT,
     localidad INT
   )`;

pool.query('DROP TABLE domicilio', (err, res) => {
  pool.query(create_table_domicilio, (err, res) => {
    console.info(`Tabla "domicilio" creada`);
  });
});

let create_table_condafip = `CREATE TABLE condafip(
     id SERIAL PRIMARY KEY,
     condicion VARCHAR(45)
   )`;

pool.query('DROP TABLE condafip', (err, res) => {
  pool.query(create_table_condafip, (err, res) => {
    console.info(`Tabla "condafip" creada`);
  });
});
