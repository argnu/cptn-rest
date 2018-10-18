const moment = require('moment');
const connector = require('../../db/connector');
const utils = require('../../utils');
const { Matricula } = require('../../model');

function getMatriculasHabilitidas() {
    let table = model.Matricula.table;
    let query = table.select(table.id)
                     .where(
                        table.estado.equals(13)
                     ).toQuery();

    return connector.execQuery(query).then(r => r.rows);
}


function crearBoleta(matricula, numero, fecha, fecha_vencimiento) {
    return Matricula.getDerechoAnual(id, new Date())
    .then(importe_anual => {
        let importe = importe_anual.valor / 12;
        let tipo = matricula.tipoEntidad === 'profesional' ? 16 : 10;

        let boleta = {
            numero,
            matricula: matricula.id,
            tipo_comprobante: tipo,
            fecha,
            total: importe,
            estado: 1,   //1 ES 'Pendiente de Pago'
            fecha_vencimiento,
            delegacion: 1, //1 es NEUQUEN
            created_by: 25, //PROCESOS DE SISTEMA
            items: [{
                item: 1,
                descripcion: `Derecho anual ${matricula.tipoEntidad == 'profesional' ? 'profesionales' : 'empresas'} ${utils.getNombreMes(mes+1)} ${anio}`,
                importe: importe
            }]
        }

        return Boleta.add(boleta);
    });
}

let matriculas_hab;

//Obtengo primero los dias de vencimiento y primer numero boleta
getMatriculasHabilitidas()
.then(matriculas => {
    matriculas_hab = matriculas;
    return Promise.all([
        ValoresGlobales.getValida(6, new Date()),
        Boleta.getNumeroBoleta(null, client)
    ])
})
.then(([dias_vencimiento, numero_boleta]) => {
    let anio = new Date().getFullYear();
    let mes = new Date().getMonth();
    let fecha = new Date(anio, mes, 1);
    let fecha_vencimiento = moment(fecha).add(dias_vencimiento.valor, 'days');

    //SI EL VENCIMIENTO CAE SABADO O DOMINGO SE PASA AL LUNES
    if (fecha_vencimiento.day() === 0)
        fecha_vencimiento = moment(fecha_vencimiento).add(1, 'days');
    else if (fecha_vencimiento.day() === 6)
        fecha_vencimiento = moment(fecha_vencimiento).add(2, 'days');

    let proms;
    for(let matricula of matriculas_hab) {
        proms.push(crearBoleta(matricula, numero_boleta, fecha, fecha_vencimiento));
        numero_boleta++;
    }
    return Promise.all(proms);
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