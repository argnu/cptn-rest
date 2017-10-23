const migracionInstitucion = require('./migracionInstitucion');
const migracionDatos = require('./migracionDatosGeograficos');
const migracionDelegacion = require('./migracionDelegacion');
const migracionEstadoMatricula = require('./migracionEstadoMatricula');
const migracionMatriculas = require('./migracionMatriculas');
const tablas = ['institucion', 'delegacion', 'pais', 'provincia', 'departamento', 'localidad'];

 function migracion() {
         return migracionInstitucion.migrarInstitucion()
           .then(r => migracionDelegacion.migrarDelegacion())
           .then(r => migracionDatos.migrarDatosGeograficos())
           .then(r => migracionEstadoMatricula.migrarEstadoMatricula())
           .then(r => migracionMatriculas.migracionMatricula())
           .catch(e => console.error(e));
   }

migracionMatriculas.migrarMatriculas()
.then(e => console.log('listo'))
.catch(e => console.error(e));
