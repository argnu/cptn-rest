const path = require('path');
global.__base = path.join(__dirname, '..');
const connector = require(`${__base}/connector`);
const model = require(`${__base}/model`);


function addUsuario(data) {
    return model.Usuario.add(data)
    .then(usuario => model.Usuario.addDelegacion(usuario.id, data.delegacion));
}

Promise.all([
    addUsuario({
        id: 'hernandezn',
        password: 'TecNQ.1320',
        nombre: 'Nicolás',
        apellido: 'Hernandez',
        email: '',
        delegacion: 1
    }),
    addUsuario({
        id: 'gonzalesga',
        password: 'TecNQ.1103',
        nombre: 'Germán Ariel',
        apellido: 'Gonzales',
        email: '',
        delegacion: 1
    }),      
    addUsuario({
        id: 'bilbaod',
        password: 'TecNQ.4280',
        nombre: 'Daniela',
        apellido: 'Bilbao',
        email: '',
        delegacion: 1
    }),     
    addUsuario({
        id: 'marquezm',
        password: 'TecNQ.6721',
        nombre: 'Micaela',
        apellido: 'Marquez',
        email: '',
        delegacion: 1
    }),      
    addUsuario({
        id: 'lastrad',
        password: 'TecZP.9834',
        nombre: 'Damián',
        apellido: 'Lastra',
        email: '',
        delegacion: 2
    }),      
    addUsuario({
        id: 'cabreram',
        password: 'TecSM.0360',
        nombre: 'Matías',
        apellido: 'Cabrera',
        email: '',
        delegacion: 3
    }),      
    addUsuario({
        id: 'valdeza',
        password: 'TecVL.6567',
        nombre: 'Ana',
        apellido: 'Valdez',
        email: '',
        delegacion: 4
    }),      
    addUsuario({
        id: 'buscharaf',
        password: 'TecCM.7654',
        nombre: 'Fabiola',
        apellido: 'Buschara',
        email: '',
        delegacion: 5
    }),      
    addUsuario({
        id: 'gentiled',
        password: 'TecJA.3412',
        nombre: 'Damián',
        apellido: 'Gentile',
        email: '',
        delegacion: 7
    })   
])
.then(r => {
    console.log('Usuario Agregados!');
    process.exit();
})
.catch(e => console.error(e));

