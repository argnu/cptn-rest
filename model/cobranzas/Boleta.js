const moment = require('moment');
const connector = require('../../db/connector');
const sql = require('sql');
sql.setDialect('postgres');

const utils = require(`../../utils`);
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
            name: 'fecha_update',
            dataType: 'date',
        },
        {
            name: 'delegacion',
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
    ],

    foreignKeys: [
        {
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id']
        },
        {
            table: 'delegacion',
            columns: ['delegacion'],
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

module.exports.getByNumero = function(numero) {
    let query = table.select(table.star())
        .from(table)
        .where(table.numero.equals(numero))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0])
}


function getNumeroBoleta(numero) {
    if (!numero) {
        let query = table.select(table.numero.max().as('numero'))
            .toQuery();
        return connector.execQuery(query)
            .then(r => r.rows[0].numero + 1);
    } else return Promise.resolve(numero);
}

function addDatosBoleta(boleta, client) {
    return getNumeroBoleta(boleta.numero)
        .then(numero_boleta => {
            let query = table.insert(
                    table.numero.value(numero_boleta),
                    table.matricula.value(boleta.matricula),
                    table.tipo_comprobante.value(boleta.tipo_comprobante),
                    table.fecha.value(boleta.fecha),
                    table.total.value(utils.getFloat(boleta.total)),
                    table.estado.value(boleta.estado),
                    table.fecha_vencimiento.value(boleta.fecha_vencimiento),
                    table.numero_comprobante.value(boleta.numero_comprobante),
                    table.numero_solicitud.value(boleta.numero_solicitud),
                    table.numero_condonacion.value(boleta.numero_condonacion),
                    table.fecha_update.value(boleta.fecha_update ? boleta.fecha_update : moment()),
                    table.delegacion.value(boleta.delegacion)
                )
                .returning(table.id, table.numero)
                .toQuery()

            return connector.execQuery(query, client)
                .then(r => r.rows[0]);
        })
}

module.exports.add = function (boleta, client) {
    let boleta_nueva;

    return addDatosBoleta(boleta, client)
    .then(boleta_added => {
        boleta_nueva = boleta_added;
        let proms_items = boleta.items.map((item, index) => {
            item.item = item.item ? item.item : index;
            item.boleta = boleta_nueva.id;
            return BoletaItem.add(item, client);
        })
        return Promise.all(proms_items);
    })
    .then(items => {
        boleta_nueva.items = items;
        return boleta_nueva;
    });
};


module.exports.patch = function(id, boleta, client) {
  boleta.fecha_update = moment();
  let query = table.update(boleta).where(table.id.equals(id)).toQuery();

  return connector.execQuery(query, client);
}
