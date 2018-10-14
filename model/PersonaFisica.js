const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');
const utils = require('../utils');

const TipoSexo = require('./tipos/TipoSexo');
const TipoEstadoCivil = require('./tipos/TipoEstadoCivil');
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
        },
        {
            name: 'fechaNacimiento',
            dataType: 'date'
          },
          {
            name: 'lugarNacimiento',
            dataType: 'varchar(100)'
          },
          {
            name: 'sexo',
            dataType: 'int'
          },
          {
            name: 'nacionalidad',
            dataType: 'varchar(45)'
          },
          {
            name: 'estadoCivil',
            dataType: 'int'
          },        
    ],
    foreignKeys: [
        {
            table: 'persona',
            columns: ['id'],
            refColumns: ['id'],
            onDelete: 'CASCADE'
        }
    ]
});

module.exports.table = table;

module.exports.getAll = function(id) {
    let query = table.select(
        table.id,
        Persona.table.nombre,
        Persona.table.cuit,
        Persona.table.telefono, 
        Persona.table.tipo,    
        table.apellido,
        table.dni,
        table.fechaNacimiento.cast('varchar(10)'),
        table.lugarNacimiento,
        table.nacionalidad,
        TipoSexo.table.id.as('sexo.id'),
        TipoSexo.table.valor.as('sexo.valor'),
        TipoEstadoCivil.table.id.as('estadoCivil.id'),
        TipoEstadoCivil.table.valor.as('estadoCivil.valor')
    )
    .from(
        table.join(Persona).on(table.id.equals(Persona.table.id))
        .join.on(table.sexo.equals(TipoSexo.table.id))
        .join(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id))       
    )
    .where(table.id.equals(id))
    .toQuery();
    
    return connector.execQuery(query)
    .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function(id) {
    let query = table.select(
        table.id,
        Persona.table.nombre,
        Persona.table.cuit,
        Persona.table.telefono, 
        Persona.table.tipo,    
        table.apellido,
        table.dni,
        table.fechaNacimiento.cast('varchar(10)'),
        table.lugarNacimiento,
        table.nacionalidad,
        TipoSexo.table.id.as('sexo.id'),
        TipoSexo.table.valor.as('sexo.valor'),
        TipoEstadoCivil.table.id.as('estadoCivil.id'),
        TipoEstadoCivil.table.valor.as('estadoCivil.valor')
    ).from(
        table.join(Persona.table).on(table.id.equals(Persona.table.id))
        .leftJoin(TipoSexo.table).on(table.sexo.equals(TipoSexo.table.id))
        .leftJoin(TipoEstadoCivil.table).on(table.estadoCivil.equals(TipoEstadoCivil.table.id))        
    )
    .where(table.id.equals(id))
    .toQuery();
    
    return connector.execQuery(query)
    .then(r => {
        let persona = r.rows[0];
        if (!persona['sexo.id']) persona.sexo = null;
        if (!persona['estadoCivil.id']) persona.estadoCivil = null;
        return dot.object(persona);
    });
}

module.exports.add = function (persona, client) {
    let query = table.insert(
        table.id.value(persona.id),
        table.apellido.value(persona.apellido),
        table.dni.value(persona.dni),
        table.fechaNacimiento.value(persona.fechaNacimiento),
        table.nacionalidad.value(persona.nacionalidad),
        table.lugarNacimiento.value(persona.lugarNacimiento),
        table.sexo.value(persona.sexo),
        table.estadoCivil.value(persona.estadoCivil)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0])
    .catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
}

module.exports.edit = function (id, persona, client) {
    let query = table.update({
        apellido: persona.apellido,
        dni: persona.dni,
        fechaNacimiento: utils.checkFecha(persona.fechaNacimiento),
        lugarNacimiento: persona.lugarNacimiento,
        nacionalidad: persona.nacionalidad,
        sexo: persona.sexo,
        estadoCivil: persona.estadoCivil
    })
    .where(table.id.equals(id))
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0])
    .catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
}