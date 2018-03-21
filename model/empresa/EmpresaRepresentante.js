const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const utils = require(`../../utils`);
const Matricula = require(`../Matricula`);
const MatriculaExterna = require(`../MatriculaExterna`);
const Profesional = require(`../profesional/Profesional`);
const Persona = require(`../Persona`);
const PersonaFisica = require(`../PersonaFisica`);


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
      name: 'matricula_externa',
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
      table: 'matricula_externa',
      columns: [ 'matricula_externa' ],
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
                table.matricula_externa.value(representante.matricula_externa),
                table.fechaInicio.value(utils.checkNull(representante.fechaInicio))
              )
              .returning(table.id, table.empresa, table.matricula, table.fechaInicio)
              .toQuery();

  return connector.execQuery(query, client);
}

function getMatricula(id) {
  let query = table.select(
    table.id, 
    table.tipo,
    table.matricula,
    table.fechaInicio.cast('varchar(10)'),
    table.fechaFin.cast('varchar(10)'),
    Matricula.table.numeroMatricula,
    Profesional.table.nombre,
    Profesional.table.apellido,
    Profesional.table.dni
  )
  .from(
    table.join(Matricula.table).on(table.matricula.equals(Matricula.table.id))
         .join(Profesional.table).on(Matricula.table.entidad.equals(Profesional.table.id))
  )
  .where(table.id.equals(id))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows[0]);
}

function getMatriculaExterna(id) {
  let query = table.select(
    table.id, 
    table.tipo,
    table.matricula_externa,
    table.fechaInicio,
    table.fechaFin,
    MatriculaExterna.table.numeroMatricula,
    MatriculaExterna.table.nombreInstitucion,
    Persona.table.nombre,
    PersonaFisica.table.apellido,
    PersonaFisica.table.dni
  )
  .from(
    table.join(MatriculaExterna.table).on(table.matricula_externa.equals(MatriculaExterna.table.id))
         .join(Persona.table).on(MatriculaExterna.table.persona.equals(Persona.table.id))
         .join(PersonaFisica.table).on(MatriculaExterna.table.persona.equals(PersonaFisica.table.id))
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
        else if (row.matricula_externa) return getMatriculaExterna(row.id);
      });   
      
      return Promise.all(proms);
  })
  .then(representantes => representantes)
  .catch(e => {
    console.error(e);
    return Promise.reject(e);
  })
}

module.exports.delete = function (data, client) {
  let query;

  if (data.matricula) {
    query = table.delete()
    .where(table.empresa.equals(data.empresa).and(table.matricula.equals(data.matricula)))
    .toQuery();
  }
  else if (data.matricula_externa) {
    query = table.delete()
    .where(table.empresa.equals(data.empresa).and(table.matricula_externa.equals(data.matricula_externa)))
    .toQuery();
  }
  
  return connector.execQuery(query, client);
}