const migracionInstitucion = require('./migracionInstitucion');
const migracionDatos = require('./migracionDatosGeograficos');
const migracionDelegacion = require('./migracionDelegacion');
const tablas = ['institucion', 'delegacion', 'pais', 'provincia', 'departamento', 'localidad'];

function migracion() {
        return migracionInstitucion.migrarInstitucion()
          .then(r => migracionDelegacion.migrarDelegacion())
          .then(r => migracionDatos.migrarDatosGeograficos())
          .catch(e => console.error(e));

  }

migracion();
