const connector = require('../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const Persona = require(`./Persona`);
const PersonaFisica = require(`./PersonaFisica`);
const Localidad = require(`./geograficos/Localidad`);

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

function getTotal(params) {
    let query;
    if (!params) {
        query = table.select(table.count().as('total')).from(table);
    }
    else {
        query = table.select(table.count(table.id).as('total'))
                     .from(
                        table.join(Persona.table).on(table.persona.equals(Persona.table.id))
                        .join(PersonaFisica.table).on(table.persona.equals(PersonaFisica.table.id))
                        .leftJoin(Localidad.table).on(table.localidad.equals(Localidad.table.id))
                     )  

        if (params.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.numeroMatricula}%`));
        if (params.apellido) query.where(PersonaFisica.table.apellido.ilike(`%${params.apellido}%`));
        if (params.dni) query.where(PersonaFisica.table.dni.ilike(`%${params.dni}%`));
        if (params.cuit) query.where(Persona.table.cuit.ilike(`%${params.cuit}%`));
    }

    return connector.execQuery(query.toQuery())
        .then(r => +r.rows[0].total);
}

module.exports.getAll = function(params) {
    let query = table.select(
        Persona.table.nombre,
        Persona.table.cuit,
        Persona.table.telefono,
        PersonaFisica.table.dni,
        PersonaFisica.table.apellido,
        table.numeroMatricula,
        table.nombreInstitucion,
        Localidad.table.nombre.as('localidad')
    )
    .from(
        table.join(Persona.table).on(table.persona.equals(Persona.table.id))
        .join(PersonaFisica.table).on(table.persona.equals(PersonaFisica.table.id))
        .leftJoin(Localidad.table).on(table.localidad.equals(Localidad.table.id))
    );
    
    if (params.numeroMatricula) query.where(table.numeroMatricula.ilike(`%${params.numeroMatricula}%`));
    if (params.apellido) query.where(PersonaFisica.table.apellido.ilike(`%${params.apellido}%`));
    if (params.dni) query.where(PersonaFisica.table.dni.ilike(`%${params.dni}%`));
    if (params.cuit) query.where(Persona.table.cuit.ilike(`%${params.cuit}%`));
     
    return Promise.all([
        connector.execQuery(query.toQuery()),
        getTotal(params),
    ]).then(([r, totalQuery]) => ({ totalQuery, resultados: r.rows  })) 
}

module.exports.get = function(id) {
    let query = table.select(
        Persona.table.nombre,
        Persona.table.cuit,
        Persona.table.telefono,
        PersonaFisica.table.dni,
        PersonaFisica.table.apellido,
        table.numeroMatricula,
        table.nombreInstitucion,
        Localidad.table.nombre.as('localidad')
    )
    .from(
        table.join(Persona.table).on(table.persona.equals(Persona.table.id))
        .join(PersonaFisica).on(table.persona.equals(PersonaFisica.table.id))
        .join(Localidad).on(table.localidad.equals(Localidad.table.id))
    )
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0]);      
}


function addPersona(persona) {
    if (persona.id) return Promise.resolve(persona);
    else return Persona.add(persona);
}

module.exports.add = function(matricula, client) {
    let persona_added = {};

    return addPersona(matricula.persona)
    .then(persona => {
        persona_added = persona;

        let query = table.insert(
            table.persona.value(persona.id),
            table.numeroMatricula.value(matricula.numeroMatricula),
            table.nombreInstitucion.value(matricula.nombreInstitucion),
            table.localidad.value(matricula.localidad)
        )
        .returning(table.star())
        .toQuery();

        return connector.execQuery(query).then(r => {
            let result = r.rows[0];
            result.persona = persona_added;
            return result;
        });
    })
}
