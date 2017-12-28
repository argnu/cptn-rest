const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');
const Matricula = require('./Matricula');
const Profesional = require('./profesional/Profesional');


const table = sql.define({
  name: 'empresa_representante',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'idEmpresa',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'idMatricula',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'fechaInicio',
      dataType: 'date'
    },
    {
      name: 'fechaFin',
      dataType: 'date'
    }
  ],

  foreignKeys: [
    {
      table: 'empresa',
      columns: [ 'idEmpresa' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'matricula',
      columns: [ 'idMatricula' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

module.exports.add = function(representante, client) {
  let query = table.insert(
                table.idEmpresa.value(representante.empresa),
                table.idMatricula.value(representante.matricula),
                table.fechaInicio.value(representante.fechaInicio)
              )
              .returning(table.id, table.idEmpresa, table.idMatricula, table.fechaInicio)
              .toQuery();

  return connector.execQuery(query, client);
}

module.exports.getAll = function(id_empresa) {
  let query = table.select(
    table.fechaInicio, table.fechaFin,
    Matricula.table.numeroMatricula,
    Profesional.table.dni,
    Profesional.table.nombre,
    Profesional.table.apellido
  )
  .from(
    table.join(Matricula.table).on(table.idMatricula.equals(Matricula.table.id))
         .join(Profesional.table).on(Matricula.table.entidad.equals(Profesional.table.id))
  )
  .where(table.idEmpresa.equals(id_empresa))
  .toQuery();

  return connector.execQuery(query)
        .then(r => r.rows);
}

module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.value(id)).toQuery();
  return connector.execQuery(query, client);
}