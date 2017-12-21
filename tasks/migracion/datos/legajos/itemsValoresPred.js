const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);

const addItem = (item)  => {
    let table = model.tareas.ItemValorPredeterminado.table;
    let id_item = `${item['CODIGOPREGUNTA']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
                  table.item.value(id_item),
                  table.valor.value(item['DESCRIPCION'].trim())
                ).toQuery();
}

module.exports.migrar = function () {
    console.log('Migrando items predeterminados de tareas...');
    let q_objetos = `select distinct t.CODIGOPREGUNTA, t.NUMEROPREGUNTA, r.DESCRIPCION
        FROM Tareas_N2_Respuestas t
        JOIN RespuestasTareas r
        ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)
        WHERE t.CODIGOPREGUNTA BETWEEN @offset AND @limit`;
    let q_limites = `select MIN(t.CODIGOPREGUNTA) as min, MAX(t.CODIGOPREGUNTA) as max FROM Tareas_N2_Respuestas t
      JOIN RespuestasTareas r
      ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)`;

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}
