const connector = require(`${__base}/connector`);
const sql = require('sql');
sql.setDialect('postgres');
const model = require(`${__base}/model`);
const utils = require(`${__base}/tasks/migracion/utils`);

const addItem = (item)  => {
    let table = model.tareas.Item.table;
    let id = `${item['CODIGO']}${item['NUMEROPREGUNTA']}`;
    let query = table.insert(
                  table.id.value(id),
                  table.descripcion.value(item['DESCRIPCION'])
                ).toQuery();

    return connector.execQuery(query);
}

module.exports.migrar = function () {
    console.log('Migrando items de tareas...');
    let q_objetos = 'select * from PreguntasTareas WHERE CODIGO BETWEEN @offset AND @limit';
    let q_limites = 'select MIN(CODIGO) as min, MAX(CODIGO) as max from PreguntasTareas';

    return utils.migrar(q_objetos, q_limites, 100, addItem);
}
