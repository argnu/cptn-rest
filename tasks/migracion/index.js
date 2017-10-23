const instituciones = require('./datos/instituciones');
const geograficos = require('./datos/geograficos');
const delegaciones = require('./datos/delegaciones');
const estadosMatricula = require('./datos/estadosMatricula');
const matriculas = require('./datos/matriculas');

function migracion() {
       return instituciones.migrar()
         .then(r => geograficos.migrar())
         .then(r => delegaciones.migrar())
         .then(r => estadosMatricula.migrar())
         .then(r => matriculas.migrar())
         .catch(e => console.error(e));
 }

migracionMatriculas.migrarMatriculas()
.then(e => console.log('listo'))
.catch(e => console.error(e));
