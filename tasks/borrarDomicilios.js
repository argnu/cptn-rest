const connector = require('../db/connector');
const model = require('../model');

let table = model.Domicilio.table;

function borrarDomicilio(id) {
    let query = table.delete().where(table.id.equals(id)).toQuery();
    return connector.execQuery(query)
    .catch(e => {
        if (e.code == '23503') return Promise.resolve();
        else return Promise.reject(e);
    })
}

let query = table.select(table.id).toQuery();

connector.execQuery(query)
.then(r => {
    console.log(`Verificando ${r.rows.length} domicilios...`);
    let domicilios = r.rows;
    return Promise.all(domicilios.map(d => borrarDomicilio(d.id)));
})
.then(r => {
    console.log('Domicilios basura eliminados!');
    process.exit();
})
.catch(e => {
    console.error(e);
    process.exit();
})