const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'persona_fisica',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'persona',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'dni',
            dataType: 'varchar(20)'
        }
    ],
    foreignKeys: [
        {
            table: 'persona',
            columns: ['persona'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;