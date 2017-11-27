const path = require('path');
global.__base = path.join(__dirname, '../..');
const instituciones = require('./datos/instituciones');
const geograficos = require('./datos/geograficos');
const delegaciones = require('./datos/delegaciones');
const matriculas = require('./datos/matriculas');
const titulos = require('./datos/titulos');
const posgrados = require('./datos/posgrados');
const cobranzas = require('./datos/cobranzas');
const legajos = require('./datos/legajos');

function migracion() {
       return instituciones.migrar()
         .then(r => geograficos.migrar())
         .then(r => delegaciones.migrar())
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => matriculas.migrar())
         .then(r => cobranzas.migrar())
         .then(r => legajos.migrar())
         .catch(e => console.error(e));
 }

function migrarTodo() {
  migracion()
  .then(e => {
    console.log('listo');
    process.exit();
  })
  .catch(e => console.error(e));
}

function migrarAlgo() {
  legajos.legajo.migrar()
  .then(e => {
    console.log('listo');
    process.exit();
  })
  .catch(e => console.error(e));
  }

// migrarTodo();
migrarAlgo();
