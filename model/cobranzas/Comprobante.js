const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobante',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'numero',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha',
            dataType: 'date',
        },
        {
            name: 'fecha_vencimiento',
            dataType: 'date',
        },
        {
            name: 'subtotal',
            dataType: 'float',
        },
        {
            name: 'interes_total',
            dataType: 'float',
        },
        {
            name: 'bonificacion_total',
            dataType: 'float',
        },
        {
            name: 'importe_total',
            dataType: 'float',
        },
        {
            name: 'importe_cancelado',
            dataType: 'float',
        },
        {
            name: 'observaciones',
            dataType: 'text',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
        {
            name: 'operador',
            dataType: 'int',
        },
        {
            name: 'anulado',
            dataType: 'int',
        },
        {
            name: 'contable',
            dataType: 'int',
        }
    ],

    foreignKeys: [{
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']
    }
    ]
});

module.exports.table = table;

module.exports.getByNumero = function(numero) {
    let query = table.select(table.star())
                     .from(table)
                     .where(table.numero.equals(numero))
                     .toQuery();

    return connector.execQuery(query)
           .then(r => r.rows[0]);
  }
