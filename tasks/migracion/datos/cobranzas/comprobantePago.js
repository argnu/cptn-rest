const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');

function addPagos(pago) {
    return model.Comprobante.getByNumero(pago['NumRecibo'])
        .then(comprobante => {
            if (comprobante) {
                let table = model.ComprobantePago.table;
                let query = table.insert(
                    table.comprobante.value(comprobante.id),
                    table.item.value(pago['Item']),
                    table.fecha_pago.value(utils.getFecha(pago['FechaPago_DATE'])),
                    table.importe.value(pago['Importe']),
                    table.forma_pago.value(pago['FormaPago']),
                    table.numero_cheque.value(pago['NroCheque']),
                    table.codigo_banco.value(pago['CodBanco']),
                    table.titular_cuenta.value(.utils.checkString(pago['TitularCuenta'])),
                    table.fecha_vto_cheque.value(utils.getFecha(pago['FECHA_VTO'])),
                    table.compensado.value(pago['Compensado'])
                ).toQuery();
                return connector.execQuery(query);
            } else {
                return Promise.resolve();
            }
        });
}

module.exports.migrar = function () {
    console.log('Migrando Comprobantes de Pago...');
    let q_objetos = `select RM.NumRecibo, RM.Item, RM.FechaPago_DATE,
    RM.Importe, RM.NroCheque, RM.CodBanco, RM.TitularCuenta,
    RM.Compensado, RM.FormaPago,
    FECHA_VTO= case when (FechaVto = '' OR FechaVto is Null) then null
    else  DATEADD(DAY, CONVERT(integer, fechaVto),'1800-12-28') end
    from RECMAT2 RM
    WHERE RM.NumRecibo BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(NumRecibo) as min, MAX(NumRecibo) as max from RECMAT2';

    return utils.migrar(q_objetos, q_limites, 100, addPagos);
}
