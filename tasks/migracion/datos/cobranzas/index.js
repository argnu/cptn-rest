const bancos = require('./bancos');
const estadoBoleta = require('./estadoBoleta');
const formaspago = require('./formaspago');
const monedas = require('./monedas');
const pagos = require('./pagos');
const tipoComprobante = require('./tipoComprobante');

bancos.migrar()
.then(r => pagos.migrar())
.then(r => monedas.migrar())
.then(r => formaspago.migrar())
.then(r => {
  console.log('listo!');
  process.exit();
})
.catch(e => console.error(e));
