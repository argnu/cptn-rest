const migracionInstitucion = require('./migracionInstitucion');
const migracionDatos = require('./migracionDatosGeograficos');

migracionInstitucion.migrarInstitucion();
migracionDatos.migrarDatosGeograficos();