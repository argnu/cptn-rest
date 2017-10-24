const instituciones = require('./datos/instituciones');
const geograficos = require('./datos/geograficos');
const delegaciones = require('./datos/delegaciones');
const matriculas = require('./datos/matriculas');
const titulos = require('./datos/titulos');
const posgrados = require('./datos/posgrados');

function migracion() {
       return instituciones.migrar()
         .then(r => geograficos.migrar())
         .then(r => delegaciones.migrar())
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => matriculas.estados.migrar())
         .then(r => matriculas.matriculas.migrar())
         .then(r => matriculas.titulos.migrar())
         .then(r => matriculas.posgrados.migrar())
         .then(r => matriculas.beneficiarios.migrar())
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

function migrar() {
  matriculas.subsidiarios.migrar()
  .then(e => { 
    console.log('listo');
    process.exit();
  })
  .catch(e => console.error(e));
  }

//migrarTodo();
migrar();

