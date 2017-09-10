const config = require('../config.private');
const sql = require('mssql');

function consultaSql(consulta, offset, limit) {
    // consulta debe tener la sentencia order by [any field] offset
    return new Promise((resolve, reject) => {
        sql.connect(config.dbMssql, function (err) {
            if (err) {
                console.log("Error de Conexión", err);
                reject(err);
            }
            new sql.Request()
                .input('offset', offset)
                .input('limit', limit)
                .query(consulta)
                .then(listaRow => {
                    sql.close();
                    resolve(listaRow);
                })
                .catch(error => {
                    console.log('Error en sql server', error);
                    reject(error);
                })
        })

    }); //Fin Promise

};

function countSql(table) {
    return new Promise((resolve, reject) => {
        sql.connect(config.dbMssql, function (err) {
            if (err) {
                console.log("Error de Conexión", err);
                reject(err);
            }
            new sql.Request()
                .query(query)
                .then(cantidadRows => {
                    resolve(cantidadRows);
                })
                .catch(error => {
                    console.log('Error', error);
                    reject(error);
                })
        })
    }); //Fin Promise

};