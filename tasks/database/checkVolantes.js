const connector = require('../../db/connector');
const model = require('../../model');

function getVolantesVencidos() {
    let table = model.VolantePago.table;
    let query = table.select(table.id)
                     .where(
                        table.fecha_vencimiento.lt(moment()),
                        table.pagado.equals(false)
                     ).toQuery();

    return connector.execQuery(query).then(r => r.rows);
}

//ESTADO 1 ES 'PENDIENTE DE PAGO'
function updateBoletas(boletas) {
    return connector.beginTransaction()
    .then(conexion => Promise.all(boletas.map(b => model.Boleta.patch(b.id, { estado: 1 }, conexion.client))))
    .then(r => connector.commit(connection.client).then(r => connection.done()))
    .catch(e => {
        connector.rollback(connection.client);
        connection.done();
        throw Error(e);
    });
}

getVolantesVencidos()
    .then(volantes => Promise.all(volantes.map(v => model.VolantePago.getBoletas(v.id))))
    .then(volantes_boletas => Promise.all(volantes_boletas.map(boletas => updateBoletas(boletas))))
    .then(r => {
        console.info("Boletas de Volantes de Pago vencidos actualizadas a 'Pendiente de Pago'");
        process.exit();
    })
    .catch(e => {
        console.error("Error actualizando boletas con volante de pago vencido");
        console.error(e);
        process.exit();
    })