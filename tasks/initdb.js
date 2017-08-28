const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

function createProfesional() {
  return new Promise(function(resolve, reject) {
      let create_table_profesional = `CREATE TABLE profesional(
           id SERIAL PRIMARY KEY,
           dni VARCHAR(10) NOT NULL,
           nombre VARCHAR(45) NOT NULL,
           apellido VARCHAR(45) NOT NULL,
           fechaNacimiento DATE NOT NULL,
           sexo VARCHAR(45),
           nacionalidad VARCHAR(45),
           estadoCivil VARCHAR(45),
           observaciones TEXT,
           cuit VARCHAR(45),
           domicilioreal INT references domicilio(id),
           domiciliolegal INT references domicilio(id),
           condafip INT references condafip(id)
         )`;

     pool.query(create_table_profesional, (err, res) => {
       if (err) reject(err);
       console.info(`Tabla "profesional" creada`);
       resolve();
     });
  });
}

function createContacto() {
  return new Promise(function(resolve, reject) {
      let create_table_contacto = `CREATE TABLE contacto(
           id SERIAL PRIMARY KEY,
           tipo VARCHAR(45) NOT NULL,
           dato VARCHAR(45) NOT NULL,
           profesional INT references profesional(id)
         )`;

     pool.query(create_table_contacto, (err, res) => {
       if (err) reject(err);
       console.info(`Tabla "contacto" creada`);
       resolve();
     });
  });
}

function createDomicilio() {
  return new Promise(function(resolve, reject) {
    let create_table_domicilio = `CREATE TABLE domicilio(
         id SERIAL PRIMARY KEY,
         calle VARCHAR(45) NOT NULL,
         numero INT NOT NULL,
         localidad INT
       )`;

     pool.query(create_table_domicilio, (err, res) => {
       if (err) reject(err);
       console.info(`Tabla "domicilio" creada`);
       resolve();
     });
  });
}

function createCondAfip() {
  return new Promise(function(resolve, reject) {
    let create_table_condafip = `CREATE TABLE condafip(
         id SERIAL PRIMARY KEY,
         condicion VARCHAR(45)
       )`;

   pool.query(create_table_condafip, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "condafip" creada`);
     resolve();
   });
  });
}

function createInstitucion() {
  return new Promise(function(resolve, reject) {
    let create_table_institucion = `CREATE TABLE institucion (
         id SERIAL PRIMARY KEY,
         nombre VARCHAR(255)
       )`;

   pool.query(create_table_institucion, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "institucion" creada`);
     resolve();
   });
  });
}

function createFormacion() {
  return new Promise(function(resolve, reject) {
    let create_table_formacion = `CREATE TABLE formacion (
         id SERIAL PRIMARY KEY,
         titulo VARCHAR(255) NOT NULL,
         tipo VARCHAR(45) NOT NULL,
         fecha DATE NOT NULL,
         institucion INT references institucion(id),
         profesional INT references profesional(id)
       )`;

   pool.query(create_table_formacion, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "formacion" creada`);
     resolve();
   });
  });
}

function createSolicitud() {
  return new Promise(function(resolve, reject) {
    let create_table_solicitud = `CREATE TABLE solicitud (
         id SERIAL PRIMARY KEY,
         fecha DATE,
         estado VARCHAR(45),
         delegacion INT references delegacion(id),
         profesional INT references profesional(id)
       )`;

   pool.query(create_table_solicitud, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "solicitud" creada`);
     resolve();
   });
  });
}

function createDelegacion() {
  return new Promise(function(resolve, reject) {
    let create_table_delegacion = `CREATE TABLE delegacion (
         id SERIAL PRIMARY KEY,
         nombre VARCHAR(255)
       )`;

   pool.query(create_table_delegacion, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "delegacion" creada`);
     resolve();
   });
  });
}

function createBeneficiarioCaja() {
  return new Promise(function(resolve, reject) {
    let create_table_beneficiario_caja = `CREATE TABLE beneficiariocaja (
         id SERIAL PRIMARY KEY,
         iditem INTEGER,
         dni VARCHAR(10),
         nombre VARCHAR(45),
         apellido VARCHAR(45),
         fechaNacimiento DATE,
         vinculo VARCHAR(45),
         invalidez BOOLEAN,
         profesional INT references profesional(id)
       )`;

   pool.query(create_table_beneficiario_caja, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "beneficiario" creada`);
     resolve();
    });
   });
 }

function createTable(name, query) {
  return new Promise(function(resolve, reject) {
   pool.query(query, (err, res) => {
     if (err) reject(err);
     console.info(`Tabla "${name}" creada`);
     resolve();
   });
  });
}

function populateOpciones() {
  return Promise.all([
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('sexo', 'femenino')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('sexo', 'masculino')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('estadocivil', 'casado')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('estadocivil', 'soltero')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('estadocivil', 'concubino')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('estadocivil', 'viudo')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('formacion', 'grado')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('formacion', 'posgrado')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('contacto', 'fijo')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('contacto', 'celular')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('contacto', 'email')`),
    pool.query(`INSERT INTO opcion (tipo, valor) VALUES ('contacto', 'web')`)
  ]);
}

function fakeData() {
  return Promise.all([
    pool.query(`INSERT INTO institucion (nombre) VALUES ('UNCO')`),
    pool.query(`INSERT INTO delegacion (nombre) VALUES ('Neuquen')`)
  ]);
}

function populate() {
  return Promise.all([
    populateOpciones(),
    fakeData()
  ])
}

pool.query('DROP TABLE IF EXISTS solicitud')
.then(r => pool.query('DROP TABLE IF EXISTS contacto'))
.then(r => pool.query('DROP TABLE IF EXISTS formacion'))
.then(r => pool.query('DROP TABLE IF EXISTS profesional'))
.then(r => pool.query('DROP TABLE IF EXISTS domicilio'))
.then(r => pool.query('DROP TABLE IF EXISTS condafip'))
.then(r => pool.query('DROP TABLE IF EXISTS institucion'))
.then(r => pool.query('DROP TABLE IF EXISTS delegacion'))
.then(rs => {
  Promise.all([
    createTable('opcion',
      `CREATE TABLE opcion (
           id SERIAL PRIMARY KEY,
           tipo VARCHAR(255),
           valor VARCHAR(255)
      )`
    ),
    createCondAfip(),
    createDomicilio(),
    createInstitucion(),
    createDelegacion()
  ])
  .then(rs => createProfesional())
  .then(r => Promise.all([createContacto(), createFormacion(), createSolicitud(), createBeneficiarioCaja()]))
  .then(rs => {
    console.info('Todas las tablas han sido creadas');

    populate()
      .then(r => {
          console.info('Tables populated!');
          process.exit();
        })
      .catch(e => {
        console.log(e)
      });
  })
  .catch(e => {
    console.error(e);
    process.exit();
  });
})
.catch(e => {
  console.error(e);
  process.exit();
});
