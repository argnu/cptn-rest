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
    .from(table)
    .where(
        table.estado.equals(1)
        .and(table.tipo_comprobante.equals())
        .and(table.matricula.equals(id))
        .and(table.fecha_vencimiento.lt(new Date()))
    )
    .toQuery();

    return connector.execQuery(sql)
    .then(r => {
        let cantidad_sin_pagar = +r.rows[0].cantidad_sin_pagar;
        if (cantidad_sin_pagar >= 4) { 
            console.log(`Matrícula ${id} Suspendida por Mora Cuatrimestral`);
            return model.Matricula.patch(id, { estado:24 });
        }
        else return Promise.resolve();
    });    
}

getMatriculasHabilitidas()
.then(matriculas => {    
    console.log(matriculas.length)
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