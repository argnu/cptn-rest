const dot = require('dot-object');
const connector = require(`../../db/connector`);
const sql = require('sql');
sql.setDialect('postgres');

const utils = require(`../../utils`);
const model = require(`../../model`);
const ComprobanteItem = require('./ComprobanteItem');
const ComprobantePago = require('./ComprobantePago');
const Boleta = require('./Boleta');
const VolantePago = require('./VolantePago');
const Matricula = require('../Matricula');
const Profesional = require('../profesional/Profesional');
const Empresa = require('../empresa/Empresa');

const table = sql.define({
    name: 'comprobante',
    columns: [{
            name: 'id',
            dataType: 'serial',
            primaryKey: true
        },
        {
            name: 'tipo_comprobante',
            dataType: 'int'
        },
        {
            name: 'numero',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'matricula',
            dataType: 'int',
            notNull: true
        },
        {
            name: 'fecha',
            dataType: 'date',
        },
        {
            name: 'fecha_vencimiento',
            dataType: 'date',
        },
        {
            name: 'subtotal',
            dataType: 'float',
        },
        {
            name: 'interes_total',
            dataType: 'float',
        },
        {
            name: 'bonificacion_total',
            dataType: 'float',
        },
        {
            name: 'importe_total',
            dataType: 'float',
        },
        {
            name: 'importe_cancelado',
            dataType: 'float',
        },
        {
            name: 'observaciones',
            dataType: 'text',
        },
        {
            name: 'delegacion',
            dataType: 'int',
        },
        {
            name: 'operador',
            dataType: 'int',
        },
        {
            name: 'anulado',
            dataType: 'int',
        },
        {
            name: 'contable',
            dataType: 'int',
        },
        {
            name: 'created_by',
            dataType: 'int',
        },
        {
            name: 'updated_by',
            dataType: 'int',
        },
        {
            name: 'created_at',
            dataType: 'timestamptz',
            defaultValue: 'current_date'
        },
        {
            name: 'updated_at',
            dataType: 'timestamptz',
            defaultValue: 'current_date'
        }
    ],

    foreignKeys: [
        {
            table: 'matricula',
            columns: ['matricula'],
            refColumns: ['id'],
            onDelete: 'cascade'
        },
        {
            table: 'delegacion',
            columns: ['delegacion'],
            refColumns: ['id']
        },
        {
            table: 'usuario',
            columns: ['created_by'],
            refColumns: ['id'],
            onUpdate: 'CASCADE'
        },
        {
            table: 'usuario',
            columns: ['updated_by'],
            refColumns: ['id'],
            onUpdate: 'CASCADE'
        }
    ]
});

const select = [
    table.id,
    table.tipo_comprobante,
    table.numero,
    Matricula.table.id.as('matricula.id'),
    Matricula.table.numeroMatricula.as('matricula.numero'),
    Profesional.table.nombre.as('matricula.profesional.nombre'),
    Profesional.table.apellido.as('matricula.profesional.apellido'),
    Empresa.table.nombre.as('matricula.empresa.nombre'),
    table.fecha.cast('varchar(10)'),
    table.fecha_vencimiento.cast('varchar(10)'),
    table.subtotal,
    table.interes_total,
    table.bonificacion_total,
    table.importe_total,
    table.importe_cancelado,
    table.observaciones,
    table.delegacion,
    table.operador,
    table.anulado,
    table.contable,
    table.created_by,
    table.updated_by
]

const from = table.join(Matricula.table).on(table.matricula.equals(Matricula.table.id))
.leftJoin(Profesional.table).on(Matricula.table.entidad.equals(Profesional.table.id))
.leftJoin(Empresa.table).on(Matricula.table.entidad.equals(Empresa.table.id))

module.exports.table = table;

module.exports.getByNumero = function (numero) {
    let query = table.select(select)
        .from(table)
        .where(table.numero.equals(numero))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0]);
}

function filter(query, params) {
    if (params.matricula) query.where(table.matricula.equals(params.matricula));
    if (params.delegacion) query.where(table.delegacion.equals(params.delegacion));

    if (params.fecha) {
        if (params.fecha.desde) query.where(table.fecha.gte(params.fecha.desde));
        if (params.fecha.hasta) query.where(table.fecha.lte(params.fecha.hasta));
    }

    if (params.fecha_vencimiento) {
        if (params.fecha_vencimiento.desde) query.where(table.fecha_vencimiento.gte(params.fecha_vencimiento.desde));
        if (params.fecha_vencimiento.hasta) query.where(table.fecha_vencimiento.lte(params.fecha_vencimiento.hasta));
    }
}

module.exports.getAll = function (params) {
    let comprobantes = [];

    let query = table.select(select).from(from);

    filter(query, params);

    if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
    if (params.sort && params.sort.numero) query.order(table.numero[params.sort.numero]);
    if (params.sort && params.sort['matricula.numero']) query.order(Matricula.table.numeroMatricula[params.sort['matricula.numero']]);
    if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
    .then(r => {
        comprobantes = r.rows.map(row => dot.object(row));
        comprobantes.forEach(c => {
            if (!c.matricula.empresa.nombre) c.matricula.entidad = c.matricula.profesional;
            else c.matricula.entidad = c.matricula.empresa;
            delete(c.matricula.profesional);
            delete(c.matricula.empresa);
        })

        return utils.getTotalQuery(table, from, (query) => filter(query, params));
    })
    .then(total => ({ totalQuery: total, resultados: comprobantes }))
    .catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
}

module.exports.get = function (id) {
    let comprobante = [];

    let query = table.select(select).from(from).where(table.id.equals(id)).toQuery();

    return connector.execQuery(query)
    .then(r => {
        comprobante = dot.object(r.rows[0]);
        if (!comprobante.matricula.empresa.nombre) comprobante.matricula.entidad = comprobante.matricula.profesional;
        else comprobante.matricula.entidad = comprobante.matricula.empresa;
        delete(comprobante.matricula.profesional);
        delete(comprobante.matricula.empresa);

        return Promise.all([
            model.ComprobanteItem.getByComprobante(comprobante.id),
            model.ComprobantePago.getByComprobante(comprobante.id)
        ])
    })
    .then(([items, pagos]) => {
        comprobante.items = items;
        comprobante.pagos = pagos;
        return comprobante;
    })
    .catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
}


function getNumeroComprobante(numero) {
    if (!numero) {
        let query = table.select(table.numero.max().as('numero'))
            .toQuery();
        return connector.execQuery(query)
            .then(r => r.rows[0].numero + 1);
    } else return Promise.resolve(numero);
}

function addComprobante(comprobante, client) {
    return getNumeroComprobante(comprobante.numero)
        .then(numero_comprobante => {
            let query = table.insert(
                    table.created_by.value(comprobante.operador),
                    table.updated_by.value(comprobante.operador),
                    table.numero.value(numero_comprobante),
                    table.matricula.value(comprobante.matricula),
                    table.fecha.value(comprobante.fecha),
                    table.fecha_vencimiento.value(utils.checkNull(comprobante.fecha_vencimiento)),
                    table.subtotal.value(comprobante.subtotal),
                    table.interes_total.value(comprobante.interes_total),
                    table.bonificacion_total.value(comprobante.bonificacion_total),
                    table.importe_total.value(utils.getFloat(comprobante.importe_total)),
                    table.importe_cancelado.value(utils.getFloat(comprobante.importe_total)),
                    table.delegacion.value(comprobante.delegacion)
                )
                .returning(table.id, table.numero, table.matricula)
                .toQuery()

            return connector.execQuery(query, client)
                .then(r => r.rows[0]);
        })
}


module.exports.add = function (comprobante) {
    let comprobante_nuevo;

    function addComprobanteItem(boleta, num_item, client) {
        let proms = [];
        let comprobante_item = {
            boleta: boleta.id,
            comprobante: comprobante_nuevo.id,
            item: num_item,
            descripcion: boleta.tipo_comprobante.descripcion,
            importe: boleta.total
        }
        proms.push(ComprobanteItem.add(comprobante_item, client));

        if (boleta.interes) {
            let interes_item = {
                boleta: boleta.id,
                comprobante: comprobante_nuevo.id,
                item: num_item + 1,
                descripcion: 'Intereses',
                importe: boleta.interes
            }
            proms.push(ComprobanteItem.add(interes_item, client));
        }
        return proms;
    }

    return connector
        .beginTransaction()
        .then(connection => {
            return addComprobante(comprobante, connection.client)
                .then(comprobante_added => {
                    comprobante_nuevo = comprobante_added;

                    let proms_comprobante_pago = comprobante.items_pago.map(forma => {
                        forma.comprobante = comprobante_nuevo.id;
                        forma.fecha_pago = comprobante.fecha;
                        return ComprobantePago.add(forma, connection.client);
                    });

                    let num_item = 1;
                    let proms_items = [];
                    let proms_boleta_estado = [];
                    let proms_volante_pagado = [];

                    comprobante.boletas.forEach(boleta => {
                        if (boleta.tipo == 'volante') {
                            let volante = boleta;
                            volante.boletas.forEach(b => {
                                proms_boleta_estado.push(Boleta.patch(b.id, { estado: 2 }, connection.client));
                                addComprobanteItem(b, num_item, connection.client)
                                .forEach(p => {
                                    proms_items.push(p);
                                    num_item++;
                                })
                            });

                            proms_volante_pagado.push(VolantePago.patch(volante.id, { pagado: true, updated_by: comprobante.operador }, connection.client));
                        }
                        else {
                            proms_boleta_estado.push(Boleta.patch(boleta.id, { estado: 2 }, connection.client));
                            addComprobanteItem(boleta, num_item, connection.client)
                            .forEach(p => {
                                proms_items.push(p);
                                num_item++;
                            })
                        }
                    })

                    return Promise.all([
                        Promise.all(proms_items),
                        Promise.all(proms_comprobante_pago),
                        Promise.all(proms_boleta_estado),
                        Promise.all(proms_volante_pagado)
                    ])
                })
                .then(r => {
                    return connector.commit(connection.client)
                        .then(r => {
                            connection.done();
                            return comprobante_nuevo;
                        });
                })
                .catch(e => {
                    connector.rollback(connection.client);
                    connection.done();
                    throw Error(e);
                });
        });
}