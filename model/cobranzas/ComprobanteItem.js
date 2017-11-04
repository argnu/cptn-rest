const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobante_item',
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
        },
        {
            name: 'boleta',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'tipo_comprobante',
            dataType: 'varchar(10)'
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuenta_contable',
            dataType: 'varchar(255)',
        },
        {
            name: 'importe',
            dataType: 'float',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos 
        }
    ],

    foreignKeys: [{
            table: 'comprobante',
            columns: ['numero'],
            refColumns: ['numero']
        },
        // {
        //     table: 'boleta',
        //     columns: ['boleta'],
        //     refColumns: ['numero']
        // }
    ]
});

module.exports.table = table;