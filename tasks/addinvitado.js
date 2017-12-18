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
then(usuario => {
  console.log('Usuario invitado agregado!');
  Promise.all([
    model.Usuario.addDelegacion(usuario.id, 1),
    model.Usuario.addDelegacion(usuario.id, 2)
  ])
  .then(r => {
    console.log('Delegaciones "Neuquén" y "Zapala" agregadas al usuario!');
    process.exit();
  })
})
.catch(e => console.error(e));
