const dot = require('dot-object');
const connector = require('../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const Localidad = require('./geograficos/Localidad');
const Departamento = require('./geograficos/Departamento');
const Provincia = require('./geograficos/Provincia');
const Pais = require('./geograficos/Pais');
const Domicilio = require('./Domicilio');

const table = sql.define({
  name: 'delegacion',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(255)',
      notNull: true
    },
    {
      name: 'domicilio',
      dataType: 'int'
    }
  ],

  foreignKeys: [
    {
      table: 'domicilio',
      columns: [ 'domicilio' ],
      refColumns: [ 'id' ]
    }
  ]
});

module.exports.table = table;

const select = [
  table.id,
  table.nombre,
  Domicilio.table.id.as('domicilio.id'),
  Domicilio.table.direccion.as('domicilio.direccion'),
  Localidad.table.id.as('domicilio.localidad.id'),
  Localidad.table.nombre.as('domicilio.localidad.nombre'),
  Departamento.table.id.as('domicilio.departamento.id'),
  Departamento.table.nombre.as('domicilio.departamento.nombre'),
  Provincia.table.id.as('domicilio.provincia.id'),
  Provincia.table.nombre.as('domicilio.provincia.nombre'),
  Pais.table.id.as('domicilio.pais.id'), 
  Pais.table.nombre.as('domicilio.pais.nombre') 
]

const from = table.leftJoin(Domicilio.table).on(table.domicilio.equals(Domicilio.table.id))
.leftJoin(Localidad.table).on(Domicilio.table.localidad.equals(Localidad.table.id))
.leftJoin(Departamento.table).on(Localidad.table.departamento.equals(Departamento.table.id))
.leftJoin(Provincia.table).on(Departamento.table.provincia.equals(Provincia.table.id))
.leftJoin(Pais.table).on(Provincia.table.pais.equals(Pais.table.id))

module.exports.getAll = function() {
  let query = table.select(select).from(from).toQuery();

  return connector.execQuery(query)
         .then(r => { 
           let delegaciones = r.rows.map(row => dot.object(row));
           delegaciones.forEach(d => {
             if (!d.domicilio.id) d.domicilio = null;
           });
           return delegaciones;
         })
}

module.exports.get = function(id) {
  let query = table.select(select)
  .from(from)
  .where(table.id.equals(id))
  .toQuery();
  
  return connector.execQuery(query)
         .then(r => dot.object(r.rows[0]));
}
