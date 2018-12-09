const moment = require('moment');
const { getNombreMes } = require('./utils');
const { Boleta, Matricula, ValoresGlobales } = require('./model');


function getTipoDom(domicilios) {
    let tipo = 'otras';
    for(let domicilio of domicilios) {
      let provincia = domicilio.domicilio.provincia.id;
      if (provincia === 14) return 'neuquen';
      else if (provincia === 7 || provincia === 8 || provincia === 23) tipo = 'limitrofes';
    }
    return tipo;
  }

function getDerechoAnual(id_matricula, fecha) {
    return Matricula.get(id_matricula)
    .then(r => {
      let id_var;
      if (r.tipoEntidad == 'profesional') id_var = 5;
      else {
        let tipo_dom = getTipoDom(matricula.entidad.domicilios);
        if (tipo_dom == 'neuquen') id_var = 10;
        else if (tipo_dom == 'limitrofes') id_var = 11;
        else id_var = 12;
      }
  
      return ValoresGlobales.getValida(id_var, fecha);
    })
}

function addBoletasMensuales(id_matricula, anio) {
    let dias_vencimiento = 120;
    let fecha = moment(`${anio}-01-01`, 'YYYY-MM-DD');

    return Promise.all([
        getDerechoAnual(id_matricula, fecha),
        Boleta.getNumeroBoleta(null)
    ])
    .then(([importe_anual, numero_boleta]) => {
      let importe = importe_anual.valor / 12;
      let anio_actual = fecha.year();  
      let promesas_boletas = [];
      let primera_boleta = true;
  
      for(let mes_inicio = fecha.month(); mes_inicio < 12; mes_inicio++) {
        let fecha_primero_mes = new Date(anio_actual, mes_inicio, 1);
        let fecha_vencimiento = moment(fecha_primero_mes).add(dias_vencimiento.valor, 'days');
        primera_boleta = false;
  
        //SI EL VENCIMIENTO CAE SABADO O DOMINGO SE PASA AL LUNES
        if (fecha_vencimiento.day() === 0)
          fecha_vencimiento = moment(fecha_vencimiento).add(1, 'days');
        else if (fecha_vencimiento.day() === 6)
          fecha_vencimiento = moment(fecha_vencimiento).add(2, 'days');
  
        let boleta = {
          numero: numero_boleta,
          matricula: id_matricula,
          tipo_comprobante: 10,
          fecha: fecha_primero_mes,
          total: importe,
          estado: 1,   //1 ES 'Pendiente de Pago'
          fecha_vencimiento: fecha_vencimiento,
          fecha_update: new Date(),
          delegacion: 1,
          items: [{
            item: 1,
            descripcion: `Derecho anual empresas ${getNombreMes(mes_inicio+1)} ${anio_actual}`,
            importe: importe
          }]
        }
  
        numero_boleta++;
        promesas_boletas.push(Boleta.add(boleta));
      }
  
      return Promise.all(promesas_boletas);
    })
  }

  addBoletasMensuales(process.argv[2], process.argv[3])
  .then(() => {
      console.log('listo!');
      process.exit();
  })
  .catch(e => {
      console.error(e);
      process.exit();
  })