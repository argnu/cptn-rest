const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);

const addItem = (item) => {
    let table = model.tareas.ItemPredeterminado.table;
    let id_item = `${item['CODIGOPREGUNTA']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
        table.item.value(id),
        table.subcategoria.value(item['CODIGOTAREAN2'])
    ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items predeterminados de tareas...');
    let q_objetos = `SELECT *
        FROM Tareas_N2_Preguntas t
        JOIN PreguntasTareas p ON (t.CODIGOPREGUNTA=p.CODIGO AND t.NUMEROPREGUNTA=p.NUMEROPREGUNTA)
        WHERE CODIGO BETWEEN @offset AND @limit`;
    let q_limites = `select 0 as min, COUNT(*) as max FROM Tareas_N2_Preguntas t
    JOIN PreguntasTareas p ON (t.CODIGOPREGUNTA=p.CODIGO AND t.NUMEROPREGUNTA=p.NUMEROPREGUNTA)`;

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}