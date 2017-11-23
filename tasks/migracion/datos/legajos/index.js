const categorias = require('./categorias');
module.exports.categorias = categorias;

module.exports.migrar = function() {
  return categorias.migrar()
//   .then(r => pagos.migrar())
//   .then(r => monedas.migrar())
//   .then(r => formaspago.migrar())
//   .then(r => estadoBoleta.migrar())
//   .then(r => tipoComprobante.migrar())
//   .then(r => boleta.migrar())
//   .then(r => boletaItem.migrar());
}
