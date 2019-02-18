const dot = require('dot-object');
const moment = require('moment');
const connector = require('../../db/connector');
const sql = require('node-sql-2');
sql.setDialect('postgres');

const utils = require(`../../utils`);
const BoletaItem = require('./BoletaItem');
const TipoComprobante = require('../tipos/TipoComprobante');
const TipoEstadoBoleta = require('../tipos/TipoEstadoBoleta');
const Legajo = require('../tareas/Legajo');
const ValoresGlobales = require('../ValoresGlobales');
const ComprobanteExencion = require('./ComprobanteExencion');

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
            name: 'legajo',
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
        {
            name: 'anulado_desc',
            dataType: 'varchar(255)',
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
            table: 'legajo',
            columns: ['legajo'],
            refColumns: ['id'],
            onDelete: 'cascade'
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

module.exports.table = table;

const select = [
    table.id,
    table.numero,
    table.matricula,
    table.legajo,
    TipoComprobante.table.id.as('tipo_comprobante.id'),
    TipoComprobante.table.descripcion.as('tipo_comprobante.descripcion'),
    TipoComprobante.table.abreviatura.as('tipo_comprobante.abreviatura'),
    table.fecha.cast('varchar(10)'),
    table.total,
    TipoEstadoBoleta.table.id.as('estado.id'),
    TipoEstadoBoleta.table.valor.as('estado.valor'),
    table.fecha_vencimiento.cast('varchar(10)'),
    table.numero_comprobante,
    table.numero_condonacion,
    table.fecha_update.cast('varchar(10)'),
    table.delegacion,
]

const from = table.join(TipoComprobante.table).on(table.tipo_comprobante.equals(TipoComprobante.table.id))
.join(TipoEstadoBoleta.table).on(table.estado.equals(TipoEstadoBoleta.table.id))

module.exports.getAll = function (params) {
    let boletas = [];

    let query = table.select(select).from(from);

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
        boletas = r.rows.map(row => dot.object(row));
        let proms = boletas.map(b => {
            return Promise.all([
                BoletaItem.getByBoleta(b.id),
                b.legajo ? Legajo.get(b.legajo) : Promise.resolve(null)
            ])
        });
        return Promise.all(proms);
    })
    .then(data_list => {
        data_list.forEach((data, index) => {
            boletas[index].items = data[0];
            boletas[index].legajo = data[1];
        });
        return boletas;
    })
    .catch(e => {
        console.error(e);
        return Promise.reject(e);
    })
}

module.exports.get = function (id) {
    let query = table.select(select)
        .from(from)
        .where(table.id.equals(id))
        .toQuery();

    let boleta;

    return connector.execQuery(query)
    .then(r => {
        boleta = dot.object(r.rows[0]);
        return Promise.all([
            BoletaItem.getByBoleta(boleta.id),
            boleta.legajo ? Legajo.get(boleta.legajo) : Promise.resolve(null)
        ])
    })
    .then(([items, legajo]) => {
        boleta.items = items;
        boleta.legajo = legajo;
        return boleta;
    });
}

module.exports.getByNumero = function(numero) {
    let query = table.select(select)
        .where(table.numero.equals(numero))
        .toQuery();

    return connector.execQuery(query)
        .then(r => r.rows[0])
}


function getNumeroBoleta(numero, client) {
    if (!numero) {
        let query = table.select(table.numero.max().as('numero'))
            .toQuery();
        return connector.execQuery(query, client)
            .then(r => r.rows[0].numero + 1);
    } else return Promise.resolve(numero);
}

module.exports.getNumeroBoleta = getNumeroBoleta;

function addDatosBoleta(boleta, client) {
    return getNumeroBoleta(boleta.numero, client)
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
                table.numero_condonacion.value(boleta.numero_condonacion),
                table.fecha_update.value(boleta.fecha_update ? boleta.fecha_update : moment()),
                table.delegacion.value(boleta.delegacion),
                table.legajo.value(boleta.legajo),
                table.created_by.value(boleta.created_by),
                table.updated_by.value(boleta.created_by)
            )
            .returning(table.id, table.numero)
            .toQuery()

        return connector.execQuery(query, client)
        .then(r => r.rows[0])
    })
}

//Verifico que no exista una boleta (PRA | EMD) para la matrícula en la misma fecha
//TRUE si está todo bien, FALSE si ya existe boleta
function checkBoletaPRA(boleta) {
    let mes = boleta.fecha.month() + 1;
    let anio = boleta.fecha.year();
    let query = table.select(table.id)
    .where(
        table.tipo_comprobante.in([16,10]),
        table.matricula.equals(boleta.matricula),
        sql.functions.MONTH(table.fecha).equals(mes),
        sql.functions.YEAR(table.fecha).equals(anio)
    )
    .toQuery();

    return connector.execQuery(query)
    .then(r => r.rows.length === 0)
}

function boletaValida(boleta) {
    // SI ES PRA o EMD
    if (boleta.tipo_comprobante === 16 || boleta.tipo_comprobante === 10) {
        return checkBoletaPRA(boleta);
    }
    else return Promise.resolve(true);
}

//VERIFICA SI EXISTE UNA BONIFICACION PARA LA BOLETA EN ESA FECHA
//SOLO PARA BOLETAS DE DERECHO ANUAL PRA|EMD
function hayBonificacion(boleta, client) {
    if (boleta.tipo_comprobante != 10 && boleta.tipo_comprobante != 16)
        return Promise.resolve(false);
    else {
        let fecha = moment(utils.getFecha(boleta.fecha), 'YYYY-MM-DD');
        let mes = fecha.month() + 1;
        let anio = fecha.year();
        let table = ComprobanteExencion.table;
        let query = table.select(table.id)
        .where(
            table.matricula.equals(boleta.matricula),
            table.tipo.equals(21),
            sql.functions.MONTH(table.fecha).equals(mes),
            sql.functions.YEAR(table.fecha).equals(anio)
        )
        .toQuery();

        return connector.execQuery(query, client)
        .then(r => r.rows.length === 0 ? false : r.rows[0])
    }
}

function crearTransaccion(client) {
    if (!client) return connector.beginTransaction();
    return Promise.resolve(false);
}

module.exports.add = function (boleta, client) {
    let boleta_nueva;
    let conexion;
    let client_transaccion = client;
    boleta.fecha = moment(utils.getFecha(boleta.fecha), 'YYYY-MM-DD');

    return crearTransaccion(client)
    .then(con => {
        if (con) {
            conexion = con;
            client_transaccion = conexion.client;
        }

        return boletaValida(boleta)
        .then(valida => {
            if (!valida) {
                return Promise.reject({
                    http_code: 409,
                    mensaje: "No se puede crear la boleta. Ya existe una para el mismo mes"
                });
            }
            else {
                return ValoresGlobales.getValida(6, new Date())
                .then(dias_vencimiento => {
                    let fecha = moment(utils.getFecha(boleta.fecha), 'YYYY-MM-DD');
                    boleta.fecha_vencimiento = fecha.add(dias_vencimiento.valor, 'days');
                    return addDatosBoleta(boleta, client_transaccion);
                })
                .then(boleta_added => {
                    boleta_nueva = boleta_added;
                    let proms_items = boleta.items.map((item, index) => {
                        item.item = item.item ? item.item : (index + 1);
                        item.boleta = boleta_nueva.id;
                        return BoletaItem.add(item, client_transaccion);
                    })
                    return Promise.all(proms_items);
                })
                .then(items => {
                    boleta_nueva.items = items;
                    return hayBonificacion(boleta, client_transaccion)
                })
                .then(bonificacion => {
                    bonificacion ? Promise.all([
                            ComprobanteExencion.patch(bonificacion.id, {
                                boleta: boleta_nueva.id,
                                importe: boleta_nueva.total
                            }, client_transaccion),

                            module.exports.patch(boleta_nueva.id, {
                                estado: 5
                            }, client_transaccion)
                        ])
                    : Promise.resolve();
                })
                .then(() => {
                    if (conexion) {
                        return connector.commit(conexion.client)
                        .then(r => {
                            conexion.done();
                          return boleta_nueva;
                        })
                    }
                    else return boleta_nueva;
                })
            }
        })
    })
    .catch(e => {
        if (conexion) {
            connector.rollback(conexion.client);
            conexion.done();
        }
        return Promise.reject(e);
    })
}


module.exports.patch = function(id, boleta, client) {
  boleta.fecha_update = new Date();
  boleta.updated_at = new Date();
  let query = table.update(boleta).where(table.id.equals(id)).toQuery();

  return connector.execQuery(query, client)
}
