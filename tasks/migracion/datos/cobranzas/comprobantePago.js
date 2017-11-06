const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobante_pago',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'comprobante',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'item',
            dataType: 'int',
        },
        {
            name: 'fecha_pago',
            dataType: 'date',
        },
        {
            name: 'importe',
            dataType: 'float',
        }
       
    ],

    foreignKeys: [{
            table: 'comprobante',
            columns: ['comprobante'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;