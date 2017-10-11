const migracionInstitucion = require('./migracionInstitucion');
const migracionDatos = require('./migracionDatosGeograficos');
const migracionDelegacion = require('./migracionDelegacion');

migracionInstitucion.migrarInstitucion();
migracionDatos.migrarDatosGeograficos();
migracionDelegacion.migrarDelegacion();