const dot = require('dot-object');
const connector = require(`../../db/connector`);
const sql = require('node-sql-2');
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
                    table.created_by.value(comprobante.created_by),
                    table.updated_by.value(comprobante.created_by),
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
    let id_matricula = comprobante.boletas[0].matricula;
    let comprobante_nuevo;
    let num_item = 0;
    let check_matricula_suspension = null;
    let check_matricula_inscripcion = null;

    function addComprobanteItem(boleta, client) {
        let proms = [];
        num_item++;
        let comprobante_item = {
            boleta: boleta.id,
            comprobante: comprobante_nuevo.id,
            item: num_item,
            descripcion: boleta.tipo_comprobante.descripcion,
            importe: boleta.total
        }
        proms.push(ComprobanteItem.add(comprobante_item, client));

        if (boleta.interes) {
            num_item++;
            let interes_item = {
                boleta: boleta.id,
                comprobante: comprobante_nuevo.id,
                item: num_item,
                descripcion: 'Intereses',
                importe: boleta.interes
            }
            proms.push(ComprobanteItem.add(interes_item, client));
        }
        return proms;
    }

    function pagarVolante(boleta, client) {
        return VolantePago.getBoletas(boleta.id)
        .then(boletas => { 
            let boleta_find = boletas.find(b => b.tipo_comprobante.id === 10
                || b.tipo_comprobante.id === 16);
            let boleta2_find = boletas.find(b => b.tipo_comprobante.id === 3 
                || b.tipo_comprobante.id === 18);
            if (boleta_find) check_matricula_suspension = boleta_find.matricula;
            if (boleta2_find) check_matricula_inscripcion = boleta2_find.matricula;

            let proms_patch = boletas.map(b => Boleta.patch(b.id, { estado: 2 }, client));
            let proms_items = boletas.map(b => Promise.all(addComprobanteItem(b, client)));                                 
            return Promise.all(
                proms_patch, 
                proms_items,
                VolantePago.patch(boleta.id, { estado: 2, updated_by: comprobante.created_by }, client)
            );
        });
    }

    function pagarBoleta(boleta, client) {
        if (boleta.tipo == 'volante') return pagarVolante(boleta, client);
        else {
            let tipo_comprobante = +boleta.tipo_comprobante.id;
            if (tipo_comprobante === 10 || tipo_comprobante === 16)
                check_matricula_suspension = boleta.matricula;
            else if (tipo_comprobante === 3 || tipo_comprobante === 18)
                check_matricula_inscripcion = boleta.matricula;
            return Boleta.patch(boleta.id, { estado: 2 }, client)
            .then(() => Promise.all(addComprobanteItem(boleta, client)));
        }
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

                    return Promise.all(proms_comprobante_pago);
                })
                .then(() => {
                    return Promise.all(comprobante.boletas.map(boleta => pagarBoleta(boleta, connection.client)));
                })
                .then(r => {
                    return connector.commit(connection.client)
                    .then(r => {
                        connection.done();
                        // Si alguna boleta era de derecho anual, se verifica la matricula
                        return check_matricula_suspension ? 
                            Matricula.verificarSuspension(check_matricula_suspension)
                            : Promise.resolve();
                    })
                    .then(() => check_matricula_inscripcion ? Matricula.verificarInscripcion(check_matricula_inscripcion) : Promise.resolve())
                    .then(() => Matricula.verificarBoletasAnio(id_matricula, new Date().getFullYear()))
                    .then(() => comprobante_nuevo);
                })
                .catch(e => {
                    connector.rollback(connection.client);
                    connection.done();
                    return Promise.reject(e);
                });
        });
}


module.exports.patch = function(id, comprobante, client) {
    comprobante.updated_at = new Date();
    let query = table.update(comprobante).where(table.id.equals(id)).toQuery();
    return connector.execQuery(query, client);
}


module.exports.anular = function(id, comprobante) {
    let conexion;

    return connector
    .beginTransaction()
    .then(con => {
        conexion = con;
        comprobante.updated_at = new Date();
        comprobante.anulado = 1;

        let query = table.update(comprobante)
        .where(table.id.equals(id))
        .toQuery();

        return connector.execQuery(query, conexion.client)
        .then(r => model.ComprobanteItem.getByComprobante(id))
        .then(items => {
            return Promise.all(items.map(i => Boleta.patch(i.boleta, {
                estado: 1,
                updated_by: comprobante.updated_by
            }, conexion.client)))
        })
        .then(r => {
            return connector.commit(conexion.client)
                .then(r => {
                    conexion.done();
                    return comprobante;
                });
        })
        .catch(e => {
            connector.rollback(conexion.client);
            conexion.done();
            return Promise.reject(e);
        });        
    })
}