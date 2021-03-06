const sql = require('node-sql-2');
sql.setDialect('postgres');

const table = sql.define({
    name: 'usuario_delegacion',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
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
            refColumns: ['id'],
            onDelete: 'CASCADE'
        },
        {
            table: 'delegacion',
            columns: ['delegacion'],
            refColumns: ['id']
        }        
    ]   
});

module.exports.table = table;