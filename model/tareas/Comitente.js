const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
    name: 'comitente',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'apellido',
            dataType: 'varchar(100)',
            notNull: true
        },
        {
            name: 'nombres',
            dataType: 'varchar(100)',
        },
        {
            name: 'empresa',
            dataType: 'varchar(50)',
        },
        {
            name: 'idempresa',
            dataType: 'int',
        },
        {
            name: 'tipo_documento',
            dataType: 'varchar(20)',
        },
        {
            name: 'numero_documento',
            dataType: 'varchar(20)',
        },
        {
            name: 'telefono',
            dataType: 'varchar(20)',
        }

    ]
});

module.exports.table = table;

module.exports.add = function(comitente, client) {
  let query = table.insert(
    table.apellido.value(comitente.apellido),
    table.nombres.value(comitente.nombres),
    table.empresa.value(comitente.empresa),
    table.numero_documento.value(comitente.numero_documento),
    table.telefono.value(comitente.telefono)
  )
  .returning(
    table.id, table.apellido, table.nombres,
    table.empresa, table.numero_documento, table.telefono
  )
  .toQuery();

  return connector.execQuery(query, client)
         .then(r => r.rows[0]);
}
