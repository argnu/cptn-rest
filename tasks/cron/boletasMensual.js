const connector = require('../../db/connector');
const model = require('../../model');

function getMatriculasHabilitidas() {
    let table = model.Matricula.table;
    let query = table.select(table.id)
                     .where(
                        table.estado.equals(13)
                     ).toQuery();

    return connector.execQuery(query).then(r => r.rows);
}


let matriculas_hab;

getMatriculasHabilitidas()
.then(matriculas => {
    matriculas_hab = matriculas;
    return model.ValoresGlobales.getAll({ nombre: 'matricula_importe_mensual' })
})
.then(valores => {
    valor_mensual = valores[0].valor;

    let boleta = {
        matricula: id,
        tipo_comprobante: x, //ACA DEBERIA IR UN NUEVO TIPO DE COMPROBANTE, CUOTA MENSUAL O ALGO ASI
        fecha: moment(),  //Fecha actual
        total: valor_mensual,
        estado: 1,   //1 ES 'Pendiente de Pago'
        fecha_vencimiento: moment().add(15, 'days'),
        created_at: moment(),
        updated_at: moment(),
        delegacion: 1, //1 es NEUQUEN
        items: [{
            item: 1,
            descripcion: '', //TAMBIEN HAY Q DETERMINAR ESTA DESCRIPCION
            importe: valor_mensual
        }]
    }

    return Boleta.add(boleta, client);        
})
.then(r => {
    console.info("Boletas mensuales generadas exitosamente!");
    process.exit();
})
.catch(e => {
    console.error("Error generando boletas mensuales");
    console.error(e);
    process.exit();
})