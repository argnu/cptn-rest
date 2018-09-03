const connector = require('../../db/connector');
const model = require('../../model');

function getMatriculasHabilitidas() {
    let table = model.Matricula.table;
    let query = table.select(table.id)
                     .where(
                        table.estado.equals(13) //HABILITADO
                        .or(table.estado.equals(1)) //JUBILADO
                     ).toQuery();

    return connector.execQuery(query)
    .then(r => r.rows);
}

function checkMatricula(id) {
    let table = model.Boleta.table;
    let sql = table.select(table.count().as('cantidad_sin_pagar'))
    .where(
        table.estado.equals(1),
        table.tipo_comprobante.in([10,16]),
        table.matricula.equals(id),
        table.fecha_vencimiento.lt(new Date())
    )
    .toQuery();

    return connector.execQuery(sql)
    .then(r => {
        let cantidad_sin_pagar = +r.rows[0].cantidad_sin_pagar;
        if (cantidad_sin_pagar >= 4) {
            let nuevo_estado = {
                matricula: id,
                estado: 24, // Suspendido por mora cuatrimestral
                updated_by: 25,   // Procesos de Sistema
                documento: 3299    //Resolución 008/18
            }
            return model.Matricula.cambiarEstado(nuevo_estado)
            .then(r => {
                console.log(`Matrícula ${id} Suspendida por Mora Cuatrimestral`);
                return Promise.resolve();
            })
        }
        else return Promise.resolve();
    });
}

getMatriculasHabilitidas()
.then(matriculas => {
    return Promise.all(matriculas.map(m => checkMatricula(m.id)))
})
.then(r => {
    console.log('Matrículas actualizadas exitosamente');
    process.exit();
})
.catch(e => {
    console.error('Error al intentar suspender las matrículas con deudas pendientes');
    console.error(e);
    process.exit();
})