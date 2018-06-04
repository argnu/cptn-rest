const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 't_comprobante',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'abreviatura',
            dataType: 'varchar(255)',
            notNull: true
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
            notNull: true
        },
        {
            name: 'cuentaAcreedora',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuentaDeudora',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuentaADevengar',
            dataType: 'varchar(255)',
        },
        {
            name: 'activo',
            dataType: 'boolean',
            defaultValue: 'true'
        }        
    ]
});

module.exports.table = table;

module.exports.getByAbreviatura = function(abreviatura) {
  let query = table.select(table.star())
                   .from(table)
                   .where(table.abreviatura.equals(abreviatura))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

module.exports.get = function(id) {
  let query = table.select(table.star())
                   .from(table)
                   .where(table.id.equals(id))
                   .toQuery();

  return connector.execQuery(query)
         .then(r => r.rows[0]);
}

module.exports.getAll = function(params) {
  let query = table.select(table.star()).from(table).where(table.activo.equals(true));
  if (params.sort && params.sort.valor) query.order(table.descripcion[params.sort.valor]);

  return connector.execQuery(query.toQuery())
  .then(r => r.rows);
}
