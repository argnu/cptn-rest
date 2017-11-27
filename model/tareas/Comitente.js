const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');


const table = sql.define({
    name: 'comitente',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'apellido',
            dataType: 'varchar(100)',
            notNull: true
        },
        {
            name: 'nombres',
            dataType: 'varchar(100)',
        },
        {
            name: 'empresa',
            dataType: 'varchar(50)',
        },
        {
            name: 'idempresa',
            dataType: 'int',
        },
        {
            name: 'tipo_documento',
            dataType: 'varchar(20)',
        },
        {
            name: 'numero_documento',
            dataType: 'varchar(20)',
        },
        {
            name: 'telefono',
            dataType: 'varchar(20)',
        }

    ]
});

module.exports.table = table;
