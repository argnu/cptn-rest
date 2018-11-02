const dot = require('dot-object');
const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const utils = require('../../utils');
const Matricula = require('../Matricula');
const Profesional = require('../profesional/Profesional');
const Persona = require('../Persona');
const PersonaFisica = require('../PersonaFisica');


const table = sql.define({
  name: 'empresa_representante',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'empresa',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'matricula',
      dataType: 'int'
    },
    {
      name: 'persona',
      dataType: 'int'
    },
    {
      name: 'fechaInicio',
      dataType: 'date'
    },
    {
      name: 'fechaFin',
      dataType: 'date'
    },
    {
      name: 'tipo',
      dataType: 'varchar(20)',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'empresa',
      columns: [ 'empresa' ],
      refColumns: [ 'id' ],
      onDelete: 'cascade'
    },
    {
      table: 'matricula',
      columns: [ 'matricula' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'persona_fisica',
      columns: [ 'persona' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

module.exports.add = function(representante, client) {
  let query = table.insert(
                table.tipo.value(representante.tipo),
                table.empresa.value(representante.empresa),
                table.matricula.value(representante.matricula),
                table.persona.value(representante.persona),
                table.fechaInicio.value(utils.checkNull(representante.fechaInicio)),
                table.fechaFin.value(utils.checkNull(representante.fechaFin))
              )
              .returning(table.id, table.empresa, table.matricula, table.fechaInicio)
              .toQuery();

  return connector.execQuery(query, client);
}

module.exports.edit = function(id, representante, client) {
  let query = table.update({
    matricula: representante.matricula,
    persona: representante.persona,
    fechaInicio: utils.checkNull(representante.fechaInicio),
    fechaFin: utils.checkNull(representante.fechaFin)
  })
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query, client);
}

function getMatricula(id) {
  let query = table.select(
    table.id, 
    table.tipo,
    table.fechaInicio.cast('varchar(10)'),
    table.fechaFin.cast('varchar(10)'),
    table.matricula.as('matricula.id'),
    Matricula.table.numeroMatricula.as('matricula.numeroMatricula'),
    Profesional.table.nombre.as('matricula.entidad.nombre'),
    Profesional.table.apellido.as('matricula.entidad.apellido'),
    Profesional.table.dni.as('matricula.entidad.dni')
  )
  .from(
    table.join(Matricula.table).on(table.matricula.equals(Matricula.table.id))
    .join(Profesional.table).on(Matricula.table.entidad.equals(Profesional.table.id))
  )
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}

function getPersona(id) {
  let query = table.select(
    table.id, 
    table.tipo,
    table.fechaInicio,
    table.fechaFin,
    table.persona.as('persona.id'),
    Persona.table.nombre.as('persona.nombre'),
    PersonaFisica.table.apellido.as('persona.apellido'),
    PersonaFisica.table.dni.as('persona.dni')
  )
  .from(
    table.persona.on(Persona.table.persona.equals(Persona.table.id))
    .join(PersonaFisica.table).on(Persona.table.id.equals(PersonaFisica.table.id))
  )
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);  
}


module.exports.getAll = function(id_empresa) {
  let query = table.select(table.star())
  .where(table.empresa.equals(id_empresa))
  .toQuery();

  return connector.execQuery(query)
  .then(r => {
      let proms = r.rows.map(row => {
        if (row.matricula) return getMatricula(row.id)
        else if (row.persona) return getPersona(row.id);
      });   
      
      return Promise.all(proms);
  })
  .then(representantes => representantes)
  .catch(e => {
    console.error(e);
    return Promise.reject(e);
  })
}