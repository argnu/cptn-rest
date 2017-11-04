const bancos = require('./bancos');
const estadoBoleta = require('./estadoBoleta');
const formaspago = require('./formaspago');
const monedas = require('./monedas');
const pagos = require('./pagos');
const tipoComprobante = require('./tipoComprobante');
const boleta = require('./boleta');
module.exports.boleta = boleta;
const boletaItem = require('./boletaItem');
module.exports.boletaItem = boletaItem;

module.exports.migrar = function() {
  return bancos.migrar()
  .then(r => pagos.migrar())
  .then(r => monedas.migrar())
  .then(r => formaspago.migrar())
  .then(r => estadoBoleta.migrar())
  .then(r => tipoComprobante.migrar())
  .then(r => boleta.migrar())
  .then(r => boletaItem.migrar());
}
