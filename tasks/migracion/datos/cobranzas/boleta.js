const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const utils = require('../../utils');


function addBoleta(boleta) {
  return model.Matricula.getMigracion(boleta['IDMATRICULADO'])
        .then(matricula => {
          let table = model.Boleta.table;
          let query = table.insert(
                        table.numero.value(boleta['NUMBOLETA']),
                        table.matricula.value(matricula.id),
                        table.tipo_comprobante.value(boleta['Tipo_doc']),
                        table.fecha.value(boleta['FECHA_DATE']),
                        table.total.value(boleta['MONTOTOTAL']),
                        table.estado.value(boleta['ESTADO']),
                        table.fecha_vencimiento.value(boleta['FECHAVTO_DATE']),
                        table.numero_comprobante.value(boleta['Num_Comprobante']),
                        table.numero_solicitud.value(boleta['Num_solicitud']),
                        table.numero_condonacion.value(boleta['Num_Condonacion']),
                        table.tipo_pago.value(boleta['CODTIPOPAGO']),
                        table.fecha_pago.value(boleta['FECHAPAGO_DATE']),
                        table.fecha_update.value(boleta['FECHA_TIME']),
                        table.delegacion.value(boleta['CodDelegacion'])
                      ).toQuery();

          return connector.execQuery(query);
        });
}


module.exports.migrar = function() {
    console.log('Migrando Boletas...');
    let q_objetos = `select b.NUMBOLETA, b.Tipo_doc, b.FECHA_DATE, b.MONTOTOTAL,
      b.ESTADO, b.FECHAVTO_DATE, b.Num_Comprobante, b.Num_solicitud, b.Num_Condonacion,
      b.CODTIPOPAGO, b.FECHAPAGO_DATE, b.FECHA_TIME, b.CodDelegacion
      from BOLETAS b inner join MATRICULAS m
      on b.IDMATRICULADO = m.ID
      WHERE b.NUMBOLETA BETWEEN @offset AND @limit`;
    let q_limites = 'select MIN(NUMBOLETA) as min, MAX(NUMBOLETA) as max from BOLETAS';

    return utils.migrar(q_objetos, q_limites, 100, addBoleta);
}
