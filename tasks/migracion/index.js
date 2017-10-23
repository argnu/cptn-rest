const instituciones = require('./datos/instituciones');
const geograficos = require('./datos/geograficos');
const delegaciones = require('./datos/delegaciones');
const matriculas = require('./datos/matriculas');
const titulos = require('./datos/titulos');
const posgrados = require('./datos/posgrados');
const beneficiarios = require('./datos/beneficiarios');
const subsidiarios = require('./datos/subsidiarios');

function migracion() {
       return instituciones.migrar()
         .then(r => geograficos.migrar())
         .then(r => delegaciones.migrar())
         .then(r => estadosMatricula.migrar())
         .then(r => matriculas.migrar())
         .catch(e => console.error(e));
 }

titulos.migrar()
.then(e => console.log('listo'))
.catch(e => console.error(e));
