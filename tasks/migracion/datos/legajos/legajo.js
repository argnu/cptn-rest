const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);


function createComitente(legajo) {
    let nuevoComitente = {};
    nuevoComitente['apellido'] = legajo['APELLIDO'];
    nuevoComitente['nombres'] = legajo['NOMBRES'];
    nuevoComitente['empresa'] = legajo['EMPRESA'];
    nuevoComitente['idempresa'] = legajo['IDEMPRESA'];
    nuevoComitente['tipo_documento'] = legajo['TIPODOC'];
    nuevoComitente['numero_documento'] = legajo['NUMDOC'];
    nuevoComitente['telefono'] = legajo['TELEFONOCOMITENTE'];
    return nuevoComitente;
}

function addLegajos(legajo) {
    return model.Matricula.getMigracion(comprobante['IDMATRICULADO'])
        .then(matricula => {
            let table = model.tareas.Legajo.table;
            let query = table.insert(
                table.solicitud.value(legajo['ID_Solicitud']),
                table.numero_legajo.value(legajo['NROLEGAJO']),
                table.tipo.value(legajo['TIPO']),
                table.matricula.value(matricula.id),
                table.fecha_solicitud.value(comprobante['FECHASOLICITUD_DATE']),
                table.comitente.value(createComitente(legajo)),
                table.direccion.value(legajo['DIRECCION']),
                table.nomenclatura.value(legajo['NOMENCLATURA']),
                table.estado.value(legajo['ESTADO']),
                table.ciudad.value(legajo['CIUDAD']),
                table.departamento.value(legajo['DEPARTAMENTO']),
                table.subcategoria.value(legajo['CODTAREAN2']),
                table.incumbencia.value(legajo['INCUMBENCIAS']),
                table.honorarios_presupuestados.value(legajo['HONORARIOSPRESUPUESTADOS']),
                table.forma_pago.value(legajo['FORMAPAGO']),
                table.plazo_cumplimiento.value(legajo['PLAZOCUMPLIMIENTOENCOMIENDA_DATE']),
                table.honorarios_reales.value(legajo['HONORARIOSREALES']),
                table.porcentaje_cumplimiento.value(legajo['PORCENTAJECUMPLIMIENTO']),
                table.finalizacion_tarea.value(legajo['FINALIZACIONTAREA_DATE']),
                table.tarea_publica.value(legajo['TAREAPUBLICA']),
                table.dependencia.value(legajo['DEPENDENCIA']),
                table.aporte_bruto.value(legajo['APORTEBRUTO']),
                table.aporte_neto.value(legajo['APORTENETO']),
                table.cantidad_planos.value(legajo['CANTIDADPLANOS']),
                table.observaciones.value(legajo['OBSERVACIONES']),
                table.observaciones_internas.value(legajo['OBSERVACIONESINTERNAS']),
                table.informacion_adicional.value(legajo['INFOADICIONAL']),
                table.evaluador.value(legajo['EVALUADOR']),
                table.delegacion.value(legajo['CodDelegacion']),
                table.numero_acta.value(legajo['NroActa']),
                table.operador_carga.value(legajo['OperadorCarge']),
                table.operador_aprobacion.value(legajo['OperadorAprobacion']),
            ).toQuery();

            return connector.execQuery(query);
        });
}



module.exports.migrar = function () {
    console.log('Migrando legajos...');
    let q_objetos = 'select * from LEGTECNICOS WHERE ID_Solicitud BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(ID_Solicitud) as min, MAX(ID_Solicitud) as max from LEGTECNICOS';

    return utils.migrar(q_objetos, q_limites, 100, addLegajos);
}