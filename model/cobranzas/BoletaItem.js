const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'boleta_item',
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
            name: 'item',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
        },
        {
            name: 'importe',
            dataType: 'float',
        },
        {
            name: 'tipo_comprobante',
            dataType: 'varchar(10)',

        }
    ],

    foreignKeys: [{
            table: 'boleta',
            columns: ['numero'],
            refColumns: ['numero']
        },
    ]
});

module.exports.table = table;
