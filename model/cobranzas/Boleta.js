const connector = require('../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const BoletaItem = require('./BoletaItem');
const TipoComprobante = require('../tipos/TipoComprobante');
const TipoEstadoBoleta = require('../tipos/TipoEstadoBoleta');

const table = sql.define({
    name: 'boleta',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'numero',
            dataType: 'int',
            notNull: true,
            unique: true
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'tipo_comprobante',
            dataType: 'int'
        },
        {
            name: 'fecha',
            dataType: 'date',
        },
        {
            name: 'total',
            dataType: 'float',
        },
        {
            name: 'estado',
            dataType: 'int',
        },
        {
            name: 'fecha_vencimiento',
            dataType: 'date',
        },
        {
            name: 'numero_comprobante',
            dataType: 'int',
        },
        {
            name: 'numero_solicitud',
            dataType: 'int',
        },
        {
            name: 'numero_condonacion',
            dataType: 'int',
        },
        {
            name: 'tipo_pago',
            dataType: 'int',
        },
        {
            name: 'fecha_pago',
            dataType: 'date',
        },
        {
            name: 'fecha_update',
            dataType: 'date',
        },
        {
            name: 'delegacion',
            dataType: 'int',
            // Agregar foreign key una vez que se confirmen los datos
        },
    ],

    foreignKeys: [{
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id']
        },
        {
            table: 't_estadoboleta',
            columns: ['estado'],
            refColumns: ['id']
        },
        {
            table: 't_comprobante',
            columns: ['tipo_comprobante'],
            refColumns: ['id']
        }
    ]
});

module.exports.table = table;

function getData(b) {
    return Promise.all([
        BoletaItem.getByBoleta(b.id),
        TipoComprobante.get(b.tipo_comprobante),
        TipoEstadoBoleta.get(b.estado)
    ])
}

module.exports.getAll = function (params) {
    let boletas = [];

    let query = table.select(table.star())
        .from(table);

   if (params.matricula) query.where(table.matricula.equals(params.matricula));
   if (params.estado) query.where(table.estado.equals(params.estado));
   if (params.fecha_desde) query.where(table.fecha_vencimiento.gte(params.fecha_desde));
   if (params.fecha_hasta) query.where(table.fecha_vencimiento.lte(params.fecha_hasta));

   if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
   if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

   if (params.limit) query.limit(+params.limit);
   if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
        .then(r => {
            boletas = r.rows;
            let proms = boletas.map(b => getData(b));
            return Promise.all(proms);
        })
        .then(data_list => {
            data_list.forEach((data, index) => {
                boletas[index].items = data[0];
                boletas[index].tipo_comprobante = data[1];
                boletas[index].estado = data[2];
            });
            return boletas;
        })
}

module.exports.get = function (id) {
    let query = table.select(table.star())
        .from(table)
        .where(table.id.equals(id))
        .toQuery();

    let boleta;

    return connector.execQuery(query)
        .then(r => {
            boleta = r.rows[0];
            return getData(boleta);
        })
        .then(([items, tipo_comprobante, estado]) => {
            boleta.items = items;
            boleta.tipo_comprobante = tipo_comprobante;
            boleta.estado = estado;
            return boleta;
        });
}

module.exports.getByNumero = function (numero) {
    let query = table.select(table.star())
        .from(table)
        .where(table.numero.equals(numero))
        .toQuery();

    let boleta;

    return connector.execQuery(query)
        .then(r => {
            boleta = r.rows[0];
            return getData(boleta);
        })
        .then(([items, tipo_comprobante, estado]) => {
            boleta.items = items;
            boleta.tipo_comprobante = tipo_comprobante;
            boleta.estado = estado;
            return boleta;
        });
}
