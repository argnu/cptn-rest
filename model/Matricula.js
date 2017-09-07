const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const Solicitud = require('./Solicitud');

const table = sql.define({
  name: 'matricula',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'fecha',
      dataType: 'date',
      notNull: true
    },
    {
      name: 'entidad',
      dataType: 'int'
    },
    {
      name: 'tipoEntidad',
      dataType: 'varchar(20)'
    },
    {
      name: 'solicitud',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'entidad',
      columns: [ 'entidad' ],
      refColumns: [ 'id' ]
    },
    {
      table: 'solicitud',
      columns: [ 'solicitud' ],
      refColumns: [ 'id' ]
    },
  ]
});

module.exports.table = table;

function addMatricula(client, matricula) {
  let query = table.insert(
    table.fecha.value(matricula.fecha),
    table.entidad.value(matricula.entidad.id),
    table.tipoEntidad.value(matricula.tipoEntidad),
    table.solicitud.value(matricula.solicitud)
  ).returning(table.id, table.fecha, table.tipoEntidad, table.entidad, table.solicitud).toQuery()
  return connector.execQuery(query, client)
         .then(r => {
           let matricula_added = r.rows[0];
           return matricula_added;
         })
}

module.exports.add = function(matricula) {
  return new Promise(function(resolve, reject) {
    connector
    .beginTransaction()
    .then(connection => {
        return Solicitud.setEstado(connection.client, matricula.solicitud, 'Aprobada')
        .then(r => addMatricula(connection.client, matricula));
      })
    });
}

module.exports.getAll = function(params) {
  let matriculas = [];
  let query = table.select(table.star()).from(table);

  if (params.tipoEntidad) query.where(table.tipoEntidad.equals(params.tipoEntidad));

  return connector.execQuery(query.toQuery())
  .then(r => {
    matriculas = r.rows;
    let proms = matriculas.map(m => {
      if (m.tipoEntidad == 'profesional') return Profesional.get(m.entidad)
      else if (m.tipoEntidad == 'empresa') return Empresa.get(m.entidad);
    });

    return Promise.all(proms)
           .then(rs => {
             rs.forEach((r, i) => {
               matriculas[i].entidad = r;
             });
             return matriculas;
           })
  })
}

module.exports.get = function(id) {
    let solicitud = {};
    let query = table.select(table.star())
                     .from(table)
                     .where(table.id.equals(id))
                     .toQuery();
    return connector.execQuery(query)
    .then(r => {
      matricula = r.rows[0];
      if (matricula.tipoEntidad == 'profesional') return Profesional.get(matricula.entidad)
      else if (matricula.tipoEntidad == 'empresa') return Empresa.get(matricula.entidad);
    })
    .then(r => {
      matricula.entidad = r;
      return matricula;
    })
}
