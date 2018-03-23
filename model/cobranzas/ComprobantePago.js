const utils = require(`../../utils`);
const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const ComprobantePagoCheque = require('./ComprobantePagoCheque');

const table = sql.define({
    name: 'comprobante_pago',
    columns: [
        {
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'comprobante',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'item',
            dataType: 'int',
        },
        {
            name: 'fecha_pago',
            dataType: 'date',
        },
        {
            name: 'importe',
            dataType: 'float',
        },
        {
            name: 'forma_pago',
            dataType: 'int'
        },
        {
            name: 'compensado',
            dataType: 'int'
        }
    ],

    foreignKeys: [
        {
            table: 'comprobante',
            columns: ['comprobante'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 't_formapago',
            columns: ['forma_pago'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

function esCheque(id) {
    return id == 10 || id == 21 || id == 39;
}

function esTarjeta(id) {
    return false;
}

const select = [
    table.id,
    table.comprobante,
    table.item,
    table.fecha_pago.cast('varchar(10)'),
    table.importe,
    table.forma_pago,
    table.compensado
]

module.exports.getByComprobante = function (id) {
    let query = table.select(select)
        .from(table)
        .where(table.comprobante.equals(id))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows);
}

module.exports.add = function(comprobante_pago, client) {
    let query = table.insert(
            table.comprobante.value(comprobante_pago.comprobante),
            table.item.value(comprobante_pago.item),
            table.fecha_pago.value(utils.checkNull(comprobante_pago.fecha_pago)),
            table.importe.value(utils.getFloat(comprobante_pago.importe)),
            table.forma_pago.value(comprobante_pago.forma_pago)
        )
        .returning(table.star())
        .toQuery()

    return connector.execQuery(query, client)
        .then(r => {
            if (esCheque(comprobante_pago.forma_pago)) {
                comprobante_pago.id = r.rows[0].id;
                return ComprobantePagoCheque.add(comprobante_pago, client);
            }
            return Promise.resolve(r.rows[0]);
    });
}