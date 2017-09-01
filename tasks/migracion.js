const {Pool} = require('pg');
const config = require('../config');
const pool = new Pool(config.db);
const sql = require('mssql');


function consultaSql(consulta) {
    var listaRegistros = [];
    console.log('Conexion', config.dbMssql);
    return new Promise((resolve, reject) => {
        sql.connect(config.dbMssql, function (err) {
            if (err) {
                console.log("Error de Conexión", err);
                reject(err);
            }
            var request = new sql.Request();
            request.stream = true;
            request.query(consulta);
            // Puede ser una consulta a una vista que tenga toda la información

            request.on('row', function (row) {
                // Emitted for each row in a recordset
                listaRegistros.push(row);
            });

            request.on('error', function (err) {
            });

            request.on('done', function (affected) {
                sql.close();
                resolve(listaRegistros);
            });

        })
        sql.on('error', function (err) {
            console.log("Error de conexión", err);
            reject(err);
        });
    }); //Fin Promise

};


function migrateDatosGeograficos(){
    consultaSql('select * from T_PAIS').then(listaPais => {
        if (listaPais){
            listaPais.forEach(function(pais) {
                
            });
        }
        console.log(listaPais);
        //Se inserta en la tabla correspondiente
    })
    .catch(err => {
        console.log('Error', err);
    });

}

migrateDatosGeograficos();
