const path = require('path');
global.__base = path.join(__dirname, '..');
const connector = require('../connector');
const model = require('../model');

model.TipoEstadoBoleta.add('Volante de Pago Generado')
.then(r => {
  console.log('Estado de Boleta agregado: Volante de PAgo Generado');
  process.exit();
})
.catch(e => console.error(e));
