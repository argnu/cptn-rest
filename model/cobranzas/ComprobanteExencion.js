const dot = require('dot-object');
const utils = require('../../utils');
const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');
const TipoComprobante = require('../tipos/TipoComprobante');


const table = sql.define({
    name: 'comprobante_exencion',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'tipo',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'boleta',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'importe',
            dataType: 'float',
            notNull: true
        },
        {
            name: 'documento',
            dataType: 'int',
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha',
            dataType: 'date',
            notNull: true
        },
        {
            name: 'delegacion',
            dataType: 'int',
        },
        {
            name: 'created_by',
            dataType: 'int',
        },
        {
            name: 'created_at',
            dataType: 'timestamptz',
            defaultValue: 'now'
        }
    ],

    foreignKeys: [{
            table: 't_comprobante',
            columns: ['tipo'],
            refColumns: ['id'],
        },
        {
            table: 'boleta',
            columns: ['boleta'],
            refColumns: ['id']
        },
        {
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 'documento',
            columns: ['documento'],
            refColumns: ['id']
        },
        {
            table: 'usuario',
            columns: ['created_by'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

const select = [
    table.id,
    TipoComprobante.table.id.as('tipo.id'),
    TipoComprobante.table.descripcion.as('tipo.descripcion'),
    TipoComprobante.table.abreviatura.as('tipo.abreviatura'),
    table.boleta,
    table.matricula,
    table.importe,
    table.documento,
    table.created_by,
    table.created_at,
    table.delegacion,
    table.fecha.cast('varchar(10)')
]

const from = table.join(TipoComprobante.table).on(table.tipo.equals(TipoComprobante.table.id));


module.exports.getAll = function (params) {
    let query = table.select(select).from(from);

    if (params.matricula) query.where(table.matricula.equals(params.matricula));
    if (params.boleta) query.where(table.boleta.equals(params.boleta));
    if (params.fecha_desde) query.where(table.fecha.gte(params.fecha_desde));
    if (params.fecha_hasta) query.where(table.fecha.lte(params.fecha_hasta));

    if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
    .then(r => r.rows.map(row => dot.object(row)));
}

module.exports.get = function(id) {
    let query = table.select(select).from(from)
    .where(table.id.equals(id))
    .toQuery();

    return connector.execQuery(query.toQuery())
    .then(r => dot.object(r.rows[0]));    
}


module.exports.add = function (comprobante_exencion, client) {
    let query = table.insert(
            table.boleta.value(comprobante_exencion.boleta),
            table.tipo.value(comprobante_exencion.tipo),
            table.importe.value(utils.getFloat(comprobante_exencion.importe)),
            table.matricula.value(comprobante_exencion.matricula),
            table.documento.value(comprobante_exencion.documento),
            table.created_by.value(comprobante_exencion.created_by),
            table.delegacion.value(comprobante_exencion.delegacion)
        )
        .returning(table.id, table.boleta, table.importe, table.matricula, table.tipo)
        .toQuery();

    return connector.execQuery(query, client).then(r => r.rows[0]);
}