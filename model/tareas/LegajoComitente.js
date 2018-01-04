const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'legajo_comitente',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'legajo',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'comitente',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'porcentaje',
            dataType: 'float',
        }
    ],

    foreignKeys: [
        {
            table: 'legajo',
            columns: ['legajo'],
            refColumns: ['id']
        },
        {
            table: 'persona',
            columns: ['comitente'],
            refColumns: ['id']
        },
    ]
});

module.exports.table = table;