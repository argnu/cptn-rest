const connector = require('../../../connector');

connector.execRawQuery('DROP SEQUENCE institucion_id_seq CASCADE; ' +
    'DROP SEQUENCE delegacion_id_seq CASCADE; ' +
    'DROP SEQUENCE pais_id_seq CASCADE; ' +
    'DROP SEQUENCE provincia_id_seq CASCADE; ' +
    'DROP SEQUENCE departamento_id_seq CASCADE; ' +
    'DROP SEQUENCE localidad_id_seq CASCADE; ')
.then(r => { 
  console.log('Autoincrementales eliminados');
  process.exit();
})    