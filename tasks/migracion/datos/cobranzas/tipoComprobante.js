const config = require('../../../../config.private');
const connector = require('../../../../connector');
const sql = require('sql');
sql.setDialect('postgres');
const model = require('../../../../model');
const sqlserver = require('../../sqlserver');

const consulta = `select * from T_TIPOASTO`;

function makeJob(consulta) {
        
        return sqlserver.query(consulta)
            .then(tipos => {
                let nuevosTipos = [];
                if (tipos) {
                    tipos.forEach(tipo => {
                        let nueva = {};
                        nueva['abreviatura'] = tipo['Tipo_doc'];
                        nueva['descripcion'] = tipo['DESCRIPCION'];
                        nueva['cuentaAcreedora'] = tipo['CUENTAACREEDORA'];
                        nueva['cuentaDeudora'] = tipo['CUENTADEUDORA'];
                        nueva['cuentaADevengar'] = tipo['CUENTAADEVENGAR'];
                        nuevosTipos.push(addTipoComprobante(nueva));
                    });
                    return Promise.all(nuevosTipos)
                } else return;
            })
            .catch(error => {
                console.log('ERROR', error);
            })

}

function addTipoComprobante(nuevo) {
    /*TODO: Ver la forma de implementar */
}


module.exports.migrar = function () {
    console.log('Migrando tipoAsto...');
    //let limites = 'select COUNT(*) as max from MAT_CAJA';
    return sqlserver.query(limites)
        .then(resultado => {
            if (resultado[0]) {
                // let max = resultado[0]['max'];
                return makeJob(consulta);
            } else return;
        })
}