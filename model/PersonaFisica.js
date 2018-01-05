const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'persona_fisica',
    columns: [
        {
            name: 'id',
            dataType: 'int',
            primaryKey: true
        },
        {
            name: 'apellido',
            dataType: 'varchar(100)'
        },
        {
            name: 'dni',
            dataType: 'varchar(20)'
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

module.exports.get = function(id) {
    let query = table.select(table.star())
                     .where(table.id.equals(id))
                     .toQuery();
    
    return connector.execQuery(query).then(r => r.rows[0]);
}

module.exports.add = function (persona, client) {
    let query = table.insert(
        table.id.value(persona.id),
        table.apellido.value(persona.apellido),
        table.dni.value(persona.dni)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}