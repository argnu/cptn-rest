const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const ComprobanteItem = require('./ComprobanteItem');
const ComprobantePago = require('./ComprobantePago');
const Boleta = require('./Boleta');

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
            // Agregar foreign key una vez que se confirmen los datos
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
        }
    ],

    foreignKeys: [{
        table: 'matricula',
        columns: ['matricula'],
        refColumns: ['id']
    }]
});

module.exports.table = table;

module.exports.getByNumero = function (numero) {
    let query = table.select(table.star())
        .from(table)
        .where(table.numero.equals(numero))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0]);
}

function getData(b) {
    return Promise.all([
        model.ComprobanteItem.getByComprobante(b.id),
        model.ComprobantePago.getByComprobante(b.id),
    ])
}

module.exports.getAll = function (params) {
    let comprobantes = [];

    let query = table.select(table.star())
        .from(table);

    if (params.matricula) query.where(table.matricula.equals(params.matricula));
    if (params.fecha_desde) query.where(table.fecha_vencimiento.gte(params.fecha_desde));
    if (params.fecha_hasta) query.where(table.fecha_vencimiento.lte(params.fecha_hasta));

    if (params.sort && params.sort.fecha) query.order(table.fecha[params.sort.fecha]);
    if (params.sort && params.sort.fecha_vencimiento) query.order(table.fecha_vencimiento[params.sort.fecha_vencimiento]);

    if (params.limit) query.limit(+params.limit);
    if (params.limit && params.offset) query.offset(+params.offset);

    return connector.execQuery(query.toQuery())
        .then(r => {
            comprobantes = r.rows;
            let proms = comprobantes.map(b => getData(b));
            return Promise.all(proms);
        })
        .then(data_list => {
            data_list.forEach((data, index) => {
                comprobantes[index].items = data[0];
                comprobantes[index].pagos = data[1];
            });
            return comprobantes;
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
                    table.numero.value(numero_comprobante),
                    table.matricula.value(comprobante.matricula),
                    table.fecha.value(comprobante.fecha),
                    table.subtotal.value(comprobante.subtotal),
                    table.interes_total.value(comprobante.interes_total),
                    table.bonificacion_total.value(comprobante.bonificacion_total),
                    table.importe_total.value(comprobante.importe_total),
                    table.importe_cancelado.value(comprobante.importe_total),
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
    let num_item = 1;

    function addComprobanteItem(boleta) {
        let proms = [];
        let comprobante_item = {
            boleta: boleta.id,
            comprobante: comprobante_nuevo.id,
            item: num_item,
            descripcion: boleta.tipo_comprobante.descripcion,
            importe: boleta.importe
        }
        proms.push(ComprobanteItem.add(comprobante_item, connection.client));
        num_item++;

        if (boleta.interes) {
            let interes_item = {
                boleta: boleta.id,
                comprobante: comprobante_nuevo.id,
                item: num_item,
                descripcion: 'Intereses',
                importe: boleta.interes
            }
            proms.push(ComprobanteItem.add(interes_item, connection.client));
            num_item++;
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
                        forma.comprobante = comprobante.id;
                        return ComprobantePago.add(forma, client);
                    });

                    let cantidad = 1;
                    let proms_items = [];
                    comprobante.boletas.forEach(boleta => {
                        if (boleta.tipo == 'volante') {
                            let volante = VolantePago.get(boleta.id);
                            volante.boletas.forEach(b => {
                                proms_items.concat(addComprobanteItem(b));
                            })
                        }
                        else {
                            proms_items.concat(addComprobanteItem(boleta));
                        }
                    })

                    //2 es 'cancelada'
                    let proms_boleta_estado = comprobante.boletas
                    .map(b => Boleta.patch(b.id, { estado: 2 }, connection.client)); 

                    return Promise.all([
                        Promise.all(proms_items),
                        Promise.all(proms_comprobantePago),
                        Promise.all(proms_boleta_estado)
                    ])
                })
                .then(([items, items_pago, boletas]) => {
                    comprobante_nuevo.items = items;
                    comprobante_nuevo.items_pago = items_pago;
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