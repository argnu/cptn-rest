const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'persona_juridica',
    columns: [
        {
            name: 'id',
            dataType: 'int',
            primaryKey: true
        }
    ],
    foreignKeys: [
        {
            table: 'persona',
            columns: ['id'],
            refColumns: ['id']
        }
    ]    
});

module.exports.table = table;

module.exports.get = function (id) {
    let query = table.select(
        table.id,
        Persona.table.nombre, Persona.table.cuit,
        Persona.table.telefono, Persona.table.tipo
    )   
    .from(table.join(Persona.table).on(table.id.equals(Persona.table.id)))
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query).then(r => r.rows[0]);
}

module.exports.add = function(persona, client) {
    let query = table.insert(
        table.id.value(persona.id)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}