const path = require('path');
const connector = require(`../../db/connector`);
const model = require(`../../model`);


function addUsuario(data) {
    return model.Usuario.add(data)
    .then(usuario => model.Usuario.addDelegacion(usuario.id, data.delegacion));
}

Promise.all([
    addUsuario({
        id: 'HERNANDEZN',
        password: 'TecNQ.1320',
        nombre: 'Nicolás',
        apellido: 'Hernandez',
        email: '',
        delegacion: 1
    }),
    addUsuario({
        id: 'GONZALESGA',
        password: 'TecNQ.1103',
        nombre: 'Germán Ariel',
        apellido: 'Gonzales',
        email: '',
        delegacion: 1
    }),      
    addUsuario({
        id: 'BILBAOD',
        password: 'TecNQ.4280',
        nombre: 'Daniela',
        apellido: 'Bilbao',
        email: '',
        delegacion: 1
    }),     
    addUsuario({
        id: 'MARQUEZM',
        password: 'TecNQ.6721',
        nombre: 'Micaela',
        apellido: 'Marquez',
        email: '',
        delegacion: 1
    }),      
    addUsuario({
        id: 'LASTRAD',
        password: 'TecZP.9834',
        nombre: 'Damián',
        apellido: 'Lastra',
        email: '',
        delegacion: 2
    }),      
    addUsuario({
        id: 'CABRERAM',
        password: 'TecSM.0360',
        nombre: 'Matías',
        apellido: 'Cabrera',
        email: '',
        delegacion: 3
    }),      
    addUsuario({
        id: 'VALDEZA',
        password: 'TecVL.6567',
        nombre: 'Ana',
        apellido: 'Valdez',
        email: '',
        delegacion: 4
    }),      
    addUsuario({
        id: 'BUSCHARAF',
        password: 'TecCM.7654',
        nombre: 'Fabiola',
        apellido: 'Buschara',
        email: '',
        delegacion: 5
    }),      
    addUsuario({
        id: 'GENTILED',
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

