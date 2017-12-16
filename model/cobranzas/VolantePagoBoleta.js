const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'volante_pago_boleta',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'volante',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'boleta',
            dataType: 'int',
            notNull: true
        },
        {
          name: 'interes',
          dataType: 'float'
        }
    ],

    foreignKeys: [
      {
        table: 'volante_pago',
        columns: ['volante'],
        refColumns: ['id']
      },
      {
        table: 'boleta',
        columns: ['boleta'],
        refColumns: ['id']
      }
    ]
})

module.exports.table = table;

module.exports.add = function(data, client) {
  let query = table.insert(
    table.volante.value(data.volante),
    table.boleta.value(data.boleta),
    table.interes.value(data.interes)
  )
  .returning(table.id, table.volante, table.boleta)
  .toQuery();

  return connector.execQuery(query, client)
         .then(r => r.rows[0]);
}
