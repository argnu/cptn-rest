const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);

const addItem = (item) => {
    let table = model.tareas.ItemPredeterminado.table;
    let id_item = `${item['CODIGOPREGUNTA']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
        table.item.value(id_item),
        table.valor.value(item['DESCRIPCION'])
    ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items predeterminados de tareas...');
    let q_objetos = `select distinct CODIGOPREGUNTA, NUMEROPREGUNTA, r.DESCRIPCION
        FROM Tareas_N2_Respuestas t
        JOIN RespuestasTareas r
        ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)
        WHERE CODIGO BETWEEN @offset AND @limit`;
    let q_limites = `select distinct 0 as min, COUNT(*) as max FROM Tareas_N2_Respuestas t
      JOIN RespuestasTareas r
      ON (t.CODIGORESPUESTA=r.CODIGO AND t.NUMERORESPUESTA=r.NUMERORESPUESTA)`;

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}