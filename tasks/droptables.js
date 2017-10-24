const connector = require('../connector');
const model = require('../model');

function* dropQuery() {
  for(let entidad in model) {
    if (!model[entidad].table) {
      for(let subentidad in model[entidad]) {
        yield connector.execQuery(model[entidad][subentidad].table.drop().cascade().ifExists().toQuery());
      }
    }
    else yield connector.execQuery(model[entidad].table.drop().cascade().ifExists().toQuery());
  }
  yield null;
}

let genDrop = dropQuery();

function dropTable() {
  let promise = genDrop.next().value;
  if (promise == null) return;
  else return promise.then(r => dropTable());
}

dropTable()
.then(r => {
  console.log('listo!');
  process.exit();
})
.catch(e => console.error(e));
