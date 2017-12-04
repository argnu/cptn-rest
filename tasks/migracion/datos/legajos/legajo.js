const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);

function prepare(legajo) {
let nuevo = legajo;
for(let att in legajo) {
    if (typeof legajo[att] == 'string')
        nuevo[att] = legajo[att].replace(/\0/g, "")
}
return nuevo;
}

function createComitente(legajo) {
    let table = model.tareas.Comitente.table;
    let query = table.insert(
      table.apellido.value(legajo['APELLIDO']),
      table.nombres.value(legajo['NOMBRES']),
      table.empresa.value(legajo['EMPRESA']),
      table.idempresa.value(legajo['IDEMPRESA']),
      table.tipo_documento.value(legajo['TIPODOC']),
      table.numero_documento.value(legajo['NUMDOC']),
      table.telefono.value(legajo['TELEFONOCOMITENTE'])
    )
    .returning(table.id)
    .toQuery()

    return connector.execQuery(query)
           .then(r => r.rows[0].id);
}



function addLegajo(legajo_1) {
    let legajo = prepare(legajo_1);
    return model.Matricula.getMigracion(legajo['IDMATRICULADO'])
        .then(matricula => {
          if (matricula) {
            return createComitente(legajo)
                  .then(id_comitente => {
                      let table = model.tareas.Legajo.table;
                      let query = table.insert(
                          table.solicitud.value(legajo['ID_Solicitud']),
                          table.numero_legajo.value(legajo['NROLEGAJO']),
                          table.tipo.value(legajo['TIPO']),
                          table.matricula.value(matricula.id),
                          table.fecha_solicitud.value(legajo['FECHASOLICITUD_DATE']),
                          table.comitente.value(id_comitente),
                          table.direccion.value(legajo['DIRECCION']),
                          table.nomenclatura.value(legajo['NOMENCLATURA']),
                          table.estado.value(legajo['ESTADO']),
                          table.ciudad.value(legajo['CIUDAD']),
                          table.departamento.value(legajo['DEPARTAMENTO']),
                          table.subcategoria.value(legajo['codTarea']),
                          table.incumbencia.value(legajo['INCUMBENCIAS']),
                          table.honorarios_presupuestados.value(legajo['HONORARIOSPRESUPUESTADOS']),
                          table.forma_pago.value(legajo['FORMAPAGO']),
                          table.plazo_cumplimiento.value(legajo['PLAZOCUMPLIMIENTOENCOMIENDA_DATE']),
                          table.honorarios_reales.value(legajo['HONORARIOSREALES']),
                          table.porcentaje_cumplimiento.value(legajo['PORCENTAJECUMPLIMIENTO']),
                          table.finalizacion_tarea.value(legajo['FINALIZACIONTAREA_DATE']),
                          table.tarea_publica.value(legajo['TAREAPUBLICA'] === 'SI' ? true : false),
                          table.dependencia.value(legajo['DEPENDENCIA'] === 1 ? true : false),
                          table.aporte_bruto.value(legajo['APORTEBRUTO']),
                          table.aporte_neto.value(legajo['APORTENETO']),
                          table.aporte_neto_bonificacion.value(legajo['APORTENETOBONIFPORAPORTEENTERMINO']),
                          table.cantidad_planos.value(legajo['CANTIDADPLANOS']),
                          table.observaciones.value(legajo['OBSERVACIONES']),
                          table.observaciones_internas.value(legajo['OBSERVACIONESINTERNAS']),
                          table.informacion_adicional.value(legajo['INFOADICIONAL']),
                          table.evaluador.value(legajo['EVALUADOR']),
                          table.delegacion.value(legajo['CodDelegacion']),
                          table.numero_acta.value(legajo['NroActa']),
                          table.operador_carga.value(legajo['OperadorCarge']),
                          table.operador_aprobacion.value(legajo['OperadorAprobacion'])
                      ).toQuery();

                      return connector.execQuery(query);
                  });
        }
        else Promise.resolve();
      })
}



module.exports.migrar = function () {
    console.log('Migrando legajos...');
    // TODO: Quitar de la condicion MatricEmp='M' cuando se migren las empresas
    let q_objetos = `select L.*, codTarea=T.codigo from LEGTECNICOS L LEFT JOIN Tareas_N2 T ON (L.CODTAREAN2= T.CODIGO) WHERE MATRICEMP='M' AND ID_Solicitud BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(ID_Solicitud) as min, MAX(ID_Solicitud) as max from LEGTECNICOS WHERE MATRICEMP='M'`;

    return utils.migrar(q_objetos, q_limites, 100, addLegajo);
}
