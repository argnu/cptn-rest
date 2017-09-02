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
      dataType: 'varchar(10)',
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
      dataType: 'varchar(45)'
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

  foreignKeys: {
    table: 'profesional',
    columns: [ 'profesional' ],
    refColumns: [ 'id' ]
  }
});

module.exports.table = table;

function addBeneficiario(client, beneficiario) {
  let query = table.insert(
    table.dni.value(beneficiario.dni), table.nombre.value(beneficiario.nombre),
    table.apellido.value(beneficiario.apellido), table.fechaNacimiento.value(beneficiario.fechaNacimiento),
    table.vinculo.value(beneficiario.vinculo), table.invalidez.value(beneficiario.invalidez),
    table.profesional.value(beneficiario.profesional)
  ).toQuery();

  return connector.execQuery(query, client);
}

module.exports.addBeneficiario = addBeneficiario;

module.exports.add = function(nuevo_beneficiario) {
  return addBeneficiario(pool, nuevo_beneficiario)
}

module.exports.getAll = function(id) {
  let query = table.select(table.star())
       .where(table.profesional.equals(id))
       .toQuery();

  return connector.execQuery(query);
}
