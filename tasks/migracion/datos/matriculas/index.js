const matriculas = require('./matriculas');
const estados = require('./estados');
const posgrados = require('./posgrados');
const titulos = require('./titulos');
const beneficiarios = require('./beneficiarios');
const subsidiarios = require('./subsidiarios');

const empresas = require('./empresas');
module.exports.empresas = empresas;

const empresarepresentantes = require('./empresarepresentantes');
module.exports.empresarepresentantes = empresarepresentantes;

 module.exports.migrar = function() {
  return estados.migrar()
         .then(r => matriculas.migrar())
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => beneficiarios.migrar())
         .then(r => subsidiarios.migrar())
         .then(r => empresas.migrar())
         .then(r => empresasrepresentantes.migrar())
 }
