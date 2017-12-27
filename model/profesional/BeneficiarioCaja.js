const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
  name: 'beneficiariocaja',
  columns: [{
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'dni',
      dataType: 'varchar(15)',
      notNull: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'apellido',
      dataType: 'varchar(45)',
      notNull: true
    },
    {
      name: 'fechaNacimiento',
      dataType: 'varchar(45)'
    },
    {
      name: 'vinculo',
      dataType: 'int'
    },
    {
      name: 'invalidez',
      dataType: 'boolean'
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
    {
      table: 'profesional',
      columns: [ 'profesional' ],
      refColumns: [ 'id' ]
    },
    {
      table: 't_vinculo',
      columns: [ 'vinculo' ],
      refColumns: [ 'id' ]
    },    
  ] 
});

module.exports.table = table;

function addBeneficiario(beneficiario, client) {
  let query = table.insert(
    table.dni.value(beneficiario.dni), table.nombre.value(beneficiario.nombre),
    table.apellido.value(beneficiario.apellido), table.fechaNacimiento.value(beneficiario.fechaNacimiento),
    table.vinculo.value(beneficiario.vinculo), table.invalidez.value(beneficiario.invalidez),
    table.profesional.value(beneficiario.profesional)
  ).returning(table.id).toQuery();

  return connector.execQuery(query, client)
         .then(r => {
           beneficiario.id = r.rows[0].id;
           return beneficiario;
         });
}

module.exports.addBeneficiario = addBeneficiario;

module.exports.getAll = function(id_profesional) {
  let query = table.select(
    table.id, table.dni, table.nombre, table.apellido,
    table.fechaNacimiento, table.vinculo,
    table.invalidez
  ).where(table.profesional.equals(id_profesional))
  .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows);
}

module.exports.delete = function (id, client) {
  let query = table.delete().where(table.id.value(id)).toQuery();
  return connector.execQuery(query, client);
}