const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
sql.setDialect('postgres');

const table = sql.define({
    name: 'usuario_rol',
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
            name: 'rol',
            dataType: 'varchar(100)',
            notNull: true
        },
   ],

    foreignKeys: [
        {
            table: 'usuario',
            columns: ['usuario'],
            refColumns: ['id'],
            onDelete: 'CASCADE'
        }
    ]   
});

module.exports.table = table;