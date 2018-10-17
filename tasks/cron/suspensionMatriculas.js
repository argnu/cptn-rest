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

getMatriculasHabilitidas()
.then(matriculas => {
    return Promise.all(matriculas.map(m => Matricula.verificarSuspension(m.id)))
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