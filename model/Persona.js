const connector = require('../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'persona',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'nombre',
            dataType: 'varchar(100)',
            notNull: true
        },
        {
            name: 'cuit',
            dataType: 'varchar(20)',
            notNull: true
        },
        {
            name: 'telefono',
            dataType: 'varchar(20)',
        }        
    ]
});

module.exports.table = table;