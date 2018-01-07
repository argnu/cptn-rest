const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'matricula_externa',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'persona',
            dataType: 'int',
            notNull: true
        },        
        {
            name: 'numeroMatricula',
            dataType: 'varchar(20)',
            notNull: true
        },
        {
            name: 'nombreInstitucion',
            dataType: 'varchar(100)',
        },
        {
            name: 'localidad',
            dataType: 'int'
        }
    ],

    foreignKeys: [
        {
            table: 'persona',
            columns: ['persona'],
            refColumns: ['id']
        },
        {
            table: 'localidad',
            columns: ['localidad'],
            refColumns: ['id']
        },
    ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
    let personas;
    let query = table.select(table.star())

    if (params.cuit) table.where(table.cuit.equals(params.cuit));

    return connector.execQuery(query.toQuery())
    .then(r => {
        persona = r.rows[0];
        if (persona.tipo == 'fisica') return PersonaFisica.get(id)
        else if (persona.tipo == 'juridica') return PersonaJuridica.get(id);
    })
    .then(data => {
        for (let col in data) {
            if (col != 'id') persona[col] = data[col];
        }
        return persona;
    })
}

module.exports.get = function(id) {
    let persona;
    let query = table.select(table.star())
                     .where(table.id.equals(id))
                     .toQuery();
    return connector.execQuery(query)
    .then(r => {
        persona = r.rows[0];
        if (persona.tipo == 'fisica') return PersonaFisica.get(id)
        else if (persona.tipo == 'juridica') return PersonaJuridica.get(id);
    })
    .then(data => {
        for (let col in data) {
            if (col != 'id') persona[col] = data[col];
        }
        return persona;
    })
}


module.exports.add = function(persona, client) {
    let query = table.insert(
        table.tipo.value(persona.tipo),
        table.nombre.value(persona.nombre),
        table.cuit.value(persona.cuit),
        table.telefono.value(persona.telefono)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => {
        persona.id = r.rows[0].id;
        if (persona.tipo == 'fisica') return PersonaFisica.add(persona, client)
        else if (persona.tipo == 'juridica') return PersonaJuridica.add(persona, client);
    })
    .then(r => r);
}
