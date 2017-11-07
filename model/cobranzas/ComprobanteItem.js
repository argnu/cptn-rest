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
            name: 'comprobante',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'item',
            dataType: 'int',
        },
        {
            name: 'boleta_item',
            dataType: 'int',
            notNull: true
        },
        // {
        //     name: 'tipo_comprobante',
        //     dataType: 'int'
        // },
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
            columns: ['comprobante'],
            refColumns: ['id']
        },
        {
            table: 'boleta_item',
            columns: ['boleta_item'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;