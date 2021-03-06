const dot = require('dot-object');
const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');

const CajaPrevisional = require('./CajaPrevisional');

 const table = sql.define({
  name: 'profesional_caja_previsional',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'profesional',
      dataType: 'int',
      notNull: true
    },
    {
      name: 'caja',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: [
      {
          table: 'profesional',
          columns: ['profesional'],
          refColumns: ['id'],
          onDelete: 'CASCADE'
      },
      {
          table: 'caja_previsional',
          columns: ['caja'],
          refColumns: ['id']
      }
  ]
});

module.exports.table = table;

const select = [
    table.id, table.profesional,
    CajaPrevisional.table.id.as('caja.id'),
    CajaPrevisional.table.nombre.as('caja.nombre')
]

const from = table.join(CajaPrevisional.table).on(table.caja.equals(CajaPrevisional.table.id));

module.exports.getAll = function(params) {
  let query = table.select(select).from(from);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.getByProfesional = function(id_prof) {
  let query = table.select(select)
  .from(from)
  .where(table.profesional.equals(id_prof));

  return connector.execQuery(query.toQuery())
  .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function(id) {
  let query = table.select(select)
    .from(from)
    .where(table.id.equals(id))
    .toQuery();
    
  return connector.execQuery(query)
  .then(r => dot.object(r.rows[0]));
}

module.exports.add = function(data, client) {    
    let query = table.insert(
        table.profesional.value(data.profesional),
        table.caja.value(data.caja)
    )
    .returning(table.star())
    .toQuery();

    return connector.execQuery(query, client)
    .then(r => r.rows[0]);
}
