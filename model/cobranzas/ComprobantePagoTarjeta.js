const utils = require(`../../utils`);
const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobante_pago_tarjeta',
    columns: [
        {
            name: 'id',
            dataType: 'int',
            primaryKey: true
        },
        {
            name: 'banco',
            dataType: 'int'
        },
        {
            name: 'tipo_tarjeta',
            dataType: 'int'
        },
        {
            name: 'lote',
            dataType: 'varchar(15)'
        },
        {
            name: 'cupon',
            dataType: 'varchar(15)'
        },
        {
            name: 'cantidad_cuotas',
            dataType: 'int'
        }
    ],

    foreignKeys: [
        {
            table: 'comprobante_pago',
            columns: ['id'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 'banco',
            columns: ['banco'],
            refColumns: ['id']
        },
        {
            table: 't_tarjeta',
            columns: ['tipo_tarjeta'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;