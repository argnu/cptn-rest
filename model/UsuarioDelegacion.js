const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'usuario_delegacion',
    columns: [{
        name: 'id',
        dataType: 'varchar(45)',
        primaryKey: true
    },
    {
        name: 'usuario',
        dataType: 'int',
        notNull: true
    },
    {
        name: 'delegacion',
        dataType: 'int',
        notNull: true
    },
   ],

    foreignKeys: [
        {
            table: 'usuario',
            columns: ['usuario'],
            refColumns: ['id']
        },
        {
            table: 'delegacion',
            columns: ['delegacion'],
            refColumns: ['id']
        }        
    ]   
});

module.exports.table = table;