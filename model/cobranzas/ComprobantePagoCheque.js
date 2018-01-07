const utils = require(`${__base}/utils`);
const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const table = sql.define({
    name: 'comprobante_pago',
    columns: [
        {
            name: 'id',
            dataType: 'int',
            primaryKey: true
        },
        {
            name: 'numero_cheque',
            dataType: 'int'
        },
        {
            name: 'banco',
            dataType: 'int'
        },
        {
            name: 'titular_cuenta',
            dataType: 'varchar(255)'
        },
        {
            name: 'fecha_vto_cheque',
            dataType: 'date'
        }
    ],

    foreignKeys: [
        {
            table: 'comprobante_pago',
            columns: ['id'],
            refColumns: ['id']
        },
        {
            table: 'banco',
            columns: ['banco'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

module.exports.add = function(comprobante_pago, client) {
    let query = table.insert(
            table.comprobante_pago.value(comprobante_pago.id),
            table.numero_cheque.value(utils.checkNull(comprobante_pago.numero_cheque)),
            table.banco.value(utils.checkNull(comprobante_pago.banco)),
            table.fecha_vto_cheque.value(utils.checkNull(comprobante_pago.fecha_vto_cheque)),
            table.titular_cuenta.value(comprobante_pago.titular_cuenta)
        )
        .returning(table.star())
        .toQuery()

    return connector.execQuery(query, client)
        .then(r => comprobante_pago);

}