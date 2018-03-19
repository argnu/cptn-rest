const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const Persona = require('./Persona');

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
            dataType: 'varchar(20)',
            notNull: true,
            // unique: true
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
    let query = table.select(
                    table.id, table.apellido, table.dni,
                    Persona.table.nombre, Persona.table.cuit,
                    Persona.table.telefono, Persona.table.tipo
                )   
                .from(table.join(Persona.table).on(table.id.equals(Persona.table.id)))
                .where(table.id.equals(id))
                .toQuery();
    
    return connector.execQuery(query).then(r => r.rows[0]);
}

function getByDni(dni) {
    let query = table.select(
        table.id, table.apellido, table.dni,
        Persona.table.nombre, Persona.table.cuit,
        Persona.table.telefono, Persona.table.tipo
    )   
    .from(table.join(Persona.table).on(table.id.equals(Persona.table.id)))
    .where(table.dni.equals(dni))
    .toQuery();
    
    return connector.execQuery(query).then(r => {
        if (!r.rows.length) return null;
        else return r.rows[0];
    });
}

module.exports.getByDni = getByDni;

module.exports.add = function (persona, client) {
    return getByDni(persona.dni)
    .then(personas => {
        if (personas.length) return Promise.reject({ code: 400, msg: 'Ya existe una persona con dicho el mismo dni'});
        else {
            let query = table.insert(
                table.id.value(persona.id),
                table.apellido.value(persona.apellido),
                table.dni.value(persona.dni)
            )
            .returning(table.star())
            .toQuery();

            return connector.execQuery(query, client).then(r => r.rows[0]);
        }
    })
}