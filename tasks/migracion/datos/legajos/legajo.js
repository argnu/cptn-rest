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
      table.apellido.value(.utils.checkString(legajo['APELLIDO'])),
      table.nombres.value(.utils.checkString(legajo['NOMBRES'])),
      table.empresa.value(.utils.checkString(legajo['EMPRESA'])),
      table.idempresa.value(legajo['IDEMPRESA']),
      table.tipo_documento.value(.utils.checkString(legajo['TIPODOC'])),
      table.numero_documento.value(legajo['NUMDOC']),
      table.telefono.value(.utils.checkString(legajo['TELEFONOCOMITENTE']))
    )
    .returning(table.id)
    .toQuery()

    return connector.execQuery(query)
           .then(r => r.rows[0].id);
}



function addLegajo(legajo_1) {
    let legajo = prepare(legajo_1);
    return model.Matricula.getMigracion(legajo['IDMATRICULADO'], legajo['MATRICEMP'] == 'E')
        .then(matricula => {
          if (matricula) {
            return Promise.all([
              model.Domicilio.addDomicilio({
                localidad: legajo.ciudad,
                calle: legajo.direccion,
                numero: ''
              }),
              createComitente(legajo)
            ])
            .then(([id_domicilio, id_comitente]) => {
                let table = model.tareas.Legajo.table;
                let query = table.insert(
                    table.solicitud.value(legajo['ID_Solicitud']),
                    table.numero_legajo.value(legajo['NROLEGAJO']),
                    table.tipo.value(legajo['TIPO']),
                    table.matricula.value(matricula.id),
                    table.fecha_solicitud.value(utils.getFecha(legajo['FECHASOLICITUD_DATE'])),
                    table.comitente.value(id_comitente),
                    table.domicilio.value(id_domicilio),
                    table.nomenclatura.value(.utils.checkString(legajo['NOMENCLATURA'])),
                    table.estado.value(.utils.checkString(legajo['ESTADO'])),
                    table.subcategoria.value(legajo['codTarea']),
                    table.incumbencia.value(legajo['INCUMBENCIAS']),
                    table.honorarios_presupuestados.value(legajo['HONORARIOSPRESUPUESTADOS']),
                    table.forma_pago.value(legajo['FORMAPAGO']),
                    table.plazo_cumplimiento.value(utils.getFecha(legajo['PLAZOCUMPLIMIENTOENCOMIENDA_DATE'])),
                    table.honorarios_reales.value(legajo['HONORARIOSREALES']),
                    table.porcentaje_cumplimiento.value(legajo['PORCENTAJECUMPLIMIENTO']),
                    table.finalizacion_tarea.value(utils.getFecha(legajo['FINALIZACIONTAREA_DATE'])),
                    table.tarea_publica.value(legajo['TAREAPUBLICA'] === 'SI' ? true : false),
                    table.dependencia.value(legajo['DEPENDENCIA'] === 1 ? true : false),
                    table.aporte_bruto.value(legajo['APORTEBRUTO']),
                    table.aporte_neto.value(legajo['APORTENETO']),
                    table.aporte_neto_bonificacion.value(legajo['APORTENETOBONIFPORAPORTEENTERMINO']),
                    table.cantidad_planos.value(legajo['CANTIDADPLANOS']),
                    table.observaciones.value(.utils.checkString(legajo['OBSERVACIONES'])),
                    table.observaciones_internas.value(.utils.checkString(legajo['OBSERVACIONESINTERNAS'])),
                    table.informacion_adicional.value(.utils.checkString(legajo['INFOADICIONAL'])),
                    table.evaluador.value(.utils.checkString(legajo['EVALUADOR'])),
                    table.delegacion.value(legajo['CodDelegacion']),
                    table.numero_acta.value(.utils.checkString(legajo['NroActa'])),
                    table.operador_carga.value(.utils.checkString(legajo['OperadorCarge'])),
                    table.operador_aprobacion.value(.utils.checkString(legajo['OperadorAprobacion']))
                ).toQuery();

                return connector.execQuery(query);
            });
        }
        else Promise.resolve();
      })
}



module.exports.migrar = function () {
    console.log('Migrando legajos...');
    let q_objetos = `select L.*, codTarea=T.codigo from LEGTECNICOS L LEFT JOIN Tareas_N2 T ON (L.CODTAREAN2= T.CODIGO) WHERE ID_Solicitud BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(ID_Solicitud) as min, MAX(ID_Solicitud) as max from LEGTECNICOS`;

    return utils.migrar(q_objetos, q_limites, 100, addLegajo);
}
