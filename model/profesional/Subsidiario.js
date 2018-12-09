const dot = require('dot-object');
const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const Persona = require('../Persona');
const PersonaFisica = require('../PersonaFisica');


const table = sql.define({
  name: 'subsidiario',
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
      name: 'porcentaje',
      dataType: 'float',
      notNull: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'persona',
      columns: [ 'persona' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ],
      onDelete: 'CASCADE'
    
   }
  ] 
});

module.exports.table = table;

const select = [
  table.id,
  table.profesional,
  table.porcentaje,
  Persona.table.id.as('persona.id'),
  Persona.table.nombre.as('persona.nombre'),
  PersonaFisica.table.apellido.as('persona.apellido'),
  PersonaFisica.table.dni.as('persona.dni')
]

const from = table.join(Persona.table).on(table.persona.equals(Persona.table.id))
.join(PersonaFisica.table).on(Persona.table.id.equals(PersonaFisica.table.id));

module.exports.getAll = function(id_profesional) {
  let query = table.select(select).from(from)
  .where(table.profesional.equals(id_profesional))
  .toQuery();

  return connector.execQuery(query)
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.add = function(subsidiario, client) {
  try {
    let query = table.insert(
      table.persona.value(subsidiario.persona),
      table.porcentaje.value(subsidiario.porcentaje),
      table.profesional.value(subsidiario.profesional)
    )
    .returning(table.id, table.persona, table.porcentaje, table.profesional)
    .toQuery();
  
    return connector.execQuery(query, client)
    .then(r => r.rows[0])
  }
  catch(e) {
    return Promise.reject(e);
  }
};

module.exports.edit = function(id, subsidiario, client) {
  let query = table.update({
    persona: subsidiario.persona,
    porcentaje: subsidiario.porcentaje
  })
  .where(table.id.equals(id))
  .returning(table.id, table.persona, table.porcentaje, table.profesional)
  .toQuery();

  return connector.execQuery(query, client)
  .then(r => r.rows[0]);
};

module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.equals(id)).toQuery();
  return connector.execQuery(query, client);
}