const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 't_comprobante',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'abreviatura',
            dataType: 'varchar(255)',
            notNull: true
        },
        {
            name: 'descripcion',
            dataType: 'varchar(255)',
            notNull: true
        },
        {
            name: 'cuentaAcreedora',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuentaDeudora',
            dataType: 'varchar(255)',
        },
        {
            name: 'cuentaADevengar',
            dataType: 'varchar(255)',
        }
    ]
});

module.exports.table = table;