const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const PersonaFisica = require(`${__base}/model/PersonaFisica`);
const PersonaJuridica = require(`${__base}/model/PersonaJuridica`);


const table = sql.define({
    name: 'persona',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'tipo',
            dataType: 'varchar(15)',
            notNull: true
        },
        {
            name: 'nombre',
            dataType: 'varchar(100)',
            notNull: true
        },
        {
            name: 'cuit',
            dataType: 'varchar(20)',
        },
        {
            name: 'telefono',
            dataType: 'varchar(20)',
        }        
    ]
});

module.exports.table = table;

module.exports.getAll = function(params) {
    let personas;
    let query = table.select(table.id, table.tipo, table.cuit, PersonaFisica.table.dni)
                     .from(table.leftJoin(PersonaJuridica.table).on(table.id.equals(PersonaJuridica.table.id))
                                .leftJoin(PersonaFisica.table).on(table.id.equals(PersonaFisica.table.id)));

    if (params.cuit) query.where(table.cuit.equals(params.cuit));
    if (params.dni) query.where(PersonaFisica.table.dni.equals(params.dni));

    return connector.execQuery(query.toQuery())
    .then(r => {
        personas = r.rows;
        let proms = personas.map(p => {
            if (p.tipo == 'fisica') return PersonaFisica.get(p.id)
            else if (p.tipo == 'juridica') return PersonaJuridica.get(p.id);
        })
        return Promise.all(proms);
    });
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
}

module.exports.getByCuit = function(cuit) {
    let persona;
    let query = table.select(table.star())
                     .where(table.cuit.equals(cuit))
                     .toQuery();
    return connector.execQuery(query)
    .then(r => {
        if (!r.rows.length) return Promise.resolve(null);
        persona = r.rows[0];
        if (persona.tipo == 'fisica') return PersonaFisica.get(id)
        else if (persona.tipo == 'juridica') return PersonaJuridica.get(id);
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
    .then(r => persona);
}
