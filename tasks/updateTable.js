const {
    Pool
} = require('pg');
const config = require('../config.private');
const pool = new Pool(config.db);

function dropSequence(client,consulta) {
    return client.query(consulta);
}

dropSequence(pool,
    'DROP SEQUENCE institucion_id_seq CASCADE; ' +
    'DROP SEQUENCE delegacion_id_seq CASCADE; ' +
    'DROP SEQUENCE pais_id_seq CASCADE; ' +
    'DROP SEQUENCE provincia_id_seq CASCADE; ' +
    'DROP SEQUENCE departamento_id_seq CASCADE; ' +
    'DROP SEQUENCE localidad_id_seq CASCADE; '
    );

console.log('Sequence eliminados')