const moment = require('moment');
const fs = require('fs');
const path = require('path');
const model = require(`../model`);
const db = require(`../db`);

init()
.then(([files, tables_bd]) => {

    function checkTypes(column, column_bd) {
        if (column.dataType == 'serial' && !(column_bd.type == 'integer')) {
            addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE integer USING "${column.name}"::integer`);
            addQuery(files.negativos, `CREATE SEQUENCE "${column.table._name}_${column.name}_seq";`);
            return addQuery(files.negativos, `ALTER SEQUENCE "${column.table._name}_${column.name}_seq" OWNED BY "${column.table._name}.${column.name}";`);
        }
        
        if (column.dataType == 'float' && !(column_bd.type == 'double precision')) 
            return addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE double precision USING "${column.name}"::double precision`);
        else if (column_bd.type == 'double precision') return;

        if (column.dataType == 'int' && !(column_bd.type == 'integer')) 
            return addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE integer USING "${column.name}"::integer`);
        else if (column_bd.type == 'integer') return;

        if (column.dataType.toLowerCase().includes('varchar') && !(column_bd.type == "character varying"))
            return addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
        else if (column_bd.type == "character varying") {
            let longitud = +column.dataType.match(/\d+/)[0];
            if (longitud != column_bd.length) 
               return addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
            else return;
        }

        if (column.dataType != column_bd.type)
            return addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" TYPE ${column.dataType} USING "${column.name}"::${column.dataType}`);
    }

    function checkForeignKeys(tablename, foreignKeys, constraints_bd) {
        for(let fkey of foreignKeys) {
            let fkey_name = `${tablename}_${fkey.columns[0]}_fkey`;
            if (!constraints_bd.find(k => k.name == fkey_name)) 
                addQuery(files.negativos, `ALTER TABLE "${tablename}" ADD FOREIGN KEY("${fkey.columns[0]}") REFERENCES ${fkey.table}("${fkey.refColumns[0]}")`
                    + (fkey.onDelete ? ` ON DELETE ${fkey.onDelete} ` : '')
                    + (fkey.onUpdate ? ` ON UPDATE ${fkey.onUpdate} ` : '')
                );
            else {
                let band = false;
                let constraint = constraints_bd.find(k => k.name == fkey_name);
                let query_chg = `ALTER TABLE ${tablename} DROP CONSTRAINT "${constraint.name}";\n`;
                query_chg += `ALTER TABLE ${tablename} ADD FOREIGN KEY("${fkey.columns[0]}" REFERENCES ${fkey.table}("${fkey.refColumns[0]}");\n`;
                if (fkey.onDelete && fkey.onDelete.toUpperCase() != constraint.on_delete) { 
                    band = true;
                    query_chg += ` ON DELETE ${fkey.onDelete.toUpperCase()};`;
                }
                if (fkey.onUpdate && fkey.onUpdate.toUpperCase() != constraint.on_update) { 
                    band = true;
                    query_chg += ` ON UPDATE ${fkey.onUpdate.toUpperCase()};`;
                }
                if (band) addQuery(files.negativos, query_chg.substring(0, query_chg.length-1));
            }
        }
    }

    function checkColumn(column, column_bd) {
        checkTypes(column, column_bd);

        if (column.notNull && column_bd.nullable)
            addQuery(files.negativos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" SET NOT NULL`);
        else if (!column.dataType == 'serial' && !column.notNull && !column_bd.nullable)
            addQuery(files.positivos, `ALTER TABLE "${column.table._name}" ALTER COLUMN "${column.name}" DROP NOT NULL`);
        
    }

    function checkColumns(table, table_bd) {
        for (let column of table.columns) {
            let column_bd = table_bd.columns.find(c => c.name == column.name);
            if (!column_bd) addQuery(files.positivos, table.alter().addColumn(column));
            else { 
                checkColumn(column, column_bd);
                column_bd.checked = true;
            }
        }
        for (let column_bd of table_bd.columns.filter(c => !c.checked)) {
            addQuery(files.negativos, `ALTER TABLE "${table_bd.name}" DROP COLUMN "${column_bd.name}"`);
        }        
    }

    function checkTable(table) {
        let table_bd = tables_bd.find(t => t.name == table._name);
        if (!table_bd) addQuery(files.positivos, table.create().toQuery().text);
        else {
            checkColumns(table, table_bd);
            checkForeignKeys(table._name, table.foreignKeys, table_bd.constraints);
            table_bd.checked = true;
        }
        
    }

    function checkModel(model) {
        for (let table in model) {
            if (typeof model[table].table == 'object') checkTable(model[table].table);
            else checkModel(model[table])
        }
    }

    checkModel(model);
    for(let table_bd of tables_bd.filter(t => !t.checked)) {
        addQuery(files.negativos, `DROP TABLE "${table_bd.name}"`);
    }
    process.exit();
})
.catch(e => console.error(e));



function init() {
    let files = {};
    return createFiles()
    .then(([f_pos, f_neg, f_mig, f_fin]) => {
        files.positivos = f_pos;
        files.negativos = f_neg;
        files.migracion = f_mig;
        files.fin = f_fin;
        return db.schema.getTables();
    })
    .then(tables => {
        return [files, tables];
    })
}

function createDir(name) {
    let newdir_name = path.join(__dirname, name);
    if (fs.existsSync(newdir_name)) return Promise.resolve(newdir_name);

    return new Promise(function(resolve, reject) {
        
        fs.mkdir(newdir_name, (err) => {
            if (err) reject(err);
            else resolve(newdir_name);
        });    
    })
}

function createFiles() {
    return createDir(moment().format('YYYY-MM-DD'))
    .then(dirname => Promise.all([
        openFile(path.join(dirname, '01. added.sql')),
        openFile(path.join(dirname, '03. changes.sql')),
        openFile(path.join(dirname, '02. pre_change.sql')),
        openFile(path.join(dirname, '04. post_change.sql'))
    ]))
}

function openFile(file, content) {
    return new Promise(function(resolve, reject) {
        fs.open(file, 'w+', (err, fd) => {
            if (err) reject(err);
            else { 
                if (content) {
                    fs.appendFile(file, content, (err) => {
                        if (err) reject(err);
                        else resolve(fd);
                    });                    
                }
                else resolve(fd);
            }
        });            
    })
}

function addQuery(file, query) {
    return new Promise(function(resolve, reject) {
        fs.appendFile(file, query + ';\n', (err) => {
            if (err) reject(err);
            else resolve(query + ';\n');
        });
    });
}

templateJS = (msg) => {
    return `
const model = require('../../model');
const connector = require('../../db/connector');

Promise
.then(r => {
    console.log('${msg}');
    process.exit();
})
.catch(e => {
    console.error(e);
    process.exit();
})
    `
}