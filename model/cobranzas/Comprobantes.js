const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobantes',
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
            name: 'interes',
            dataType: 'float',
        },
        {
            name: 'bonificacion',
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
            dataType: 'varchar(255)',
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
