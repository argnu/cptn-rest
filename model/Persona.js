const connector = require('../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');
const PersonaFisica = require(`./PersonaFisica`);
const PersonaJuridica = require(`./PersonaJuridica`);
const utils = require('../utils');


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

function filter(query, params) {
    if (params.tipo) query.where(table.tipo.equals(params.tipo));
    if (params.cuit) query.where(table.cuit.equals(params.cuit));
    if (params.dni) query.where(PersonaFisica.table.dni.equals(params.dni));

    if (params.filtros) {
        if (params.filtros.nombre) query.where(table.nombre.ilike(`%${params.filtros.nombre}%`));
        if (params.filtros.apellido) query.where(PersonaFisica.table.apellido.ilike(`%${params.filtros.apellido}%`));
        if (params.filtros.dni) query.where(PersonaFisica.table.dni.ilike(`%${params.filtros.dni}%`));
        if (params.filtros.cuit) query.where(table.cuit.ilike(`%${params.filtros.cuit}%`));
    }
}

module.exports.getAll = function(params) {
    let personas;
    let from = table.leftJoin(PersonaJuridica.table).on(table.id.equals(PersonaJuridica.table.id))
    .leftJoin(PersonaFisica.table).on(table.id.equals(PersonaFisica.table.id));

    let query = table.select(table.id, table.tipo, table.cuit, PersonaFisica.table.dni)
                     .from(from);

    filter(query, params);

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);    

    return connector.execQuery(query.toQuery())
    .then(r => {
        personas = r.rows;
        let proms = personas.map(p => {
            if (p.tipo == 'fisica') return PersonaFisica.get(p.id)
            else if (p.tipo == 'juridica') return PersonaJuridica.get(p.id);
        })
        return Promise.all(proms);
    })
    .then(result => {
        personas = result;
        return utils.getTotalQuery(table, from, (query) => filter(query, params))
    })
    .then(totalQuery => ({ resultados: personas, totalQuery }));
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

function getByCuit(cuit) {
    if (!cuit || !cuit.length) return Promise.resolve([]);

    let personas;
    let query = table.select(table.star())
                     .where(table.cuit.equals(cuit))
                     .toQuery();

    return connector.execQuery(query)
    .then(r => {
        personas = r.rows;
        let proms = personas.map(p => {
            if (p.tipo == 'fisica') return PersonaFisica.get(p.id)
            else if (p.tipo == 'juridica') return PersonaJuridica.get(p.id);
        })
        return Promise.all(proms);
    });
}

module.exports.getByCuit = getByCuit;


module.exports.add = function(persona, client) {
    try {
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
        .then(r => persona)
        .catch(e => {
            console.error(e);
            return Promise.reject(e);
        })
    }
    catch(e) {
        console.error(e);
        return Promise.reject(e);
    }
}


module.exports.edit = function(id, persona, client) {
    delete(persona.id);

    try {
        let query = table.update({
            tipo: persona.tipo,
            nombre: persona.nombre,
            cuit: persona.cuit,
            telefono: persona.telefono
        })
        .where(table.id.equals(id))
        .returning(table.star())
        .toQuery();

        return connector.execQuery(query, client)
        .then(r => {
            if (persona.tipo == 'fisica') return PersonaFisica.edit(id, persona, client)
            else if (persona.tipo == 'juridica') return PersonaJuridica.edit(id, persona, client);
        })
        .then(r => persona)
        .catch(e => {
            console.error(e);
            return Promise.reject(e);
        })
    }
    catch(e) {
        console.error(e);
        return Promise.reject(e);
    }
}

module.exports.delete = function(id) {
    let query = table.delete()
    .where(table.id.equals(id))
    .returning(table.id, table.nombre)
    .toQuery();
  
    return connector.execQuery(query)
    .then(r => r.rows[0])
    .catch(e => {
      if (e.code == 23503) {
        return Promise.reject({ http_code: 409, mensaje: "No se puede borrar el recurso. Otros recursos dependen del mismo" });
      }
      else return Promise.reject(e);
    });
  }
  