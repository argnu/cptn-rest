const path = require('path');
global.__base = path.join(__dirname, '..');
const connector = require('../connector');
const model = require('../model');

model.Usuario.add({
  id: 'invitado',
  password: '123456',
  nombre: 'Invitado',
  apellido: 'CPTN',
  email: 'invitado@cptn.org'
}).
then(r => {
  console.log('Usuario invitado agregado!');
  process.exit();
})
.catch(e => console.error(e));
