const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'persona_juridica',
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