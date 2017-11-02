const matriculas = require('./matriculas');
const estados = require('./estados');
const posgrados = require('./posgrados');
const titulos = require('./titulos');
const beneficiarios = require('./beneficiarios');
const subsidiarios = require('./subsidiarios');

 module.exports.migrar = function() {
  return estados.migrar()
         .then(r => matriculas.migrar())
         .then(r => titulos.migrar())
         .then(r => posgrados.migrar())
         .then(r => beneficiarios.migrar())
         .then(r => subsidiarios.migrar());
 }
