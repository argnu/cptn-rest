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
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => matriculas.estados.migrar())
         //.then(r => matriculas.migrar())
         .catch(e => console.error(e));
 }

migracion()
.then(e => { 
  console.log('listo');
  process.exit();
})
.catch(e => console.error(e));
