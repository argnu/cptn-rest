const moment = require('moment');
const connector = require('../db/connector');
const { getNombreMes } = require('../utils');
const { Entidad, Boleta, Matricula, ValoresGlobales } = require('../model');

if (!process.argv[2]) {
    console.log('Debe ingresar el año como parámetro');
    process.exit();
}

function getMatriculasHabilitidas() {
    let table = Matricula.table;
    let query = table.select(table.id, Entidad.table.tipo)
        .from(table.join(Entidad.table).on(table.entidad.equals(Entidad.table.id)))
        .where(table.estado.equals(13))
        .toQuery();

    return connector.execQuery(query).then(r => r.rows);
}

function crearBoleta(matricula, numero, fecha, fecha_vencimiento, importe_anual) {
    let importe = importe_anual.valor / 12;
    let tipo = matricula.tipo === 'profesional' ? 16 : 10;
    let mes = fecha.getMonth();
    let anio = fecha.getFullYear();

    let boleta = {
        numero,
        matricula: matricula.id,
        tipo_comprobante: tipo,
        fecha,
        total: importe,
        estado: 1,   //1 ES 'Pendiente de Pago'
        fecha_vencimiento: fecha_vencimiento.format('YYYY-MM-DD'),
        delegacion: 1, //1 es NEUQUEN
        created_by: 25, //PROCESOS DE SISTEMA
        items: [{
            item: 1,
            descripcion: `Derecho anual ${matricula.tipo == 'profesional' ? 'profesionales' : 'empresas'} ${getNombreMes(mes+1)} ${anio}`,
            importe: importe
        }]
    }

    return boleta;
}

function addBoletasMensuales(matricula, anio, dias_vencimiento) {
    let fecha = moment(`${anio}-01-01`, 'YYYY-MM-DD');

    return Matricula.getDerechoAnual(matricula.id, fecha.format('YYYY-MM-DD'))
    .then(importe_anual => {
      let anio_actual = fecha.year();
      let boletas = [];

      for(let mes_inicio = fecha.month(); mes_inicio < 12; mes_inicio++) {
        let fecha_primero_mes = new Date(anio_actual, mes_inicio, 1);
        let fecha_vencimiento = moment(fecha_primero_mes).add(dias_vencimiento.valor, 'days');

        //SI EL VENCIMIENTO CAE SABADO O DOMINGO SE PASA AL LUNES
        if (fecha_vencimiento.day() === 0)
          fecha_vencimiento = moment(fecha_vencimiento).add(1, 'days');
        else if (fecha_vencimiento.day() === 6)
          fecha_vencimiento = moment(fecha_vencimiento).add(2, 'days');

        boletas.push(crearBoleta(matricula, numero_boleta, fecha_primero_mes, fecha_vencimiento, importe_anual));
        numero_boleta++;
      }

      return boletas;
    })
  }


let matriculas_hab;
let numero_boleta;

//Obtengo primero los dias de vencimiento y primer numero boleta
getMatriculasHabilitidas()
.then(matriculas => {
    matriculas_hab = matriculas;
    return Promise.all([
        Boleta.getNumeroBoleta(null),
        ValoresGlobales.getValida(6, new Date())
    ])
})
.then(([num, dias_vencimiento]) => {
    numero_boleta = num
    let proms = matriculas_hab.map(m => addBoletasMensuales(m, process.argv[2], dias_vencimiento));

    return Promise.all(proms).then((boletas) => {
        let boletas_creadas = [].concat.apply([], boletas);

        function* itBoleta(boletas) {
            for(let b of boletas) yield Boleta.add(b);
        }

        var it = itBoleta(boletas_creadas);
    
        function crearBoletas() {
            let p = it.next().value;
            if (p) return p.then(r => crearBoletas()).catch(e => {
                console.error(e); return crearBoletas()})
            else return Promise.resolve();
        }
        return crearBoletas();
    });
})
.then(() => {
    console.info("Boletas anuales generadas exitosamente!");
    process.exit();
})
.catch(e => {
    console.error("Error generando boletas anuales");
    console.error(e);
    process.exit();
})