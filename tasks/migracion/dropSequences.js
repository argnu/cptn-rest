const connector = require('../../connector');

(function dropSequences() {
    return connector.execRawQuery('DROP SEQUENCE institucion_id_seq CASCADE; ' +
    'DROP SEQUENCE delegacion_id_seq CASCADE; ' +
    'DROP SEQUENCE pais_id_seq CASCADE; ' +
    'DROP SEQUENCE provincia_id_seq CASCADE; ' +
    'DROP SEQUENCE departamento_id_seq CASCADE; ' +
    'DROP SEQUENCE localidad_id_seq CASCADE; ');
})()
.then(r => {
  console.log('Sequence eliminados');
  process.exit();
})
.catch(e => console.error(e));
