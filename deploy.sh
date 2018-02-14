#!/bin/bash

ENV='test'
BRANCH='develop'

while [ "$1" != "" ]; do
    case $1 in
        -e | --env )           shift
                                ENV=$1
                                ;;
        -u | --usuario )       shift
                                USUARIO=$1
                                ;;
        -p | --pass )           shift
                                PASS=$1
                                ;;
    esac
    shift
done

if [ $ENV = "prod" ]; then
    $BRANCH = 'master'
fi

if [ "$DIR_APP" != "" ]; then
else
   echo "Son obligatorios los siguientes tres parámetros:"
   echo "   -u : el usuario de la base de datos"
   echo "   -p : la clave de usuario de la base de datos"
fi

echo "Parando servicio cptnapi \n";
sudo service cptnapi stop;

echo "Actualizando repositorio \n";
git checkout $BRANCH;
git pull;

echo "Instalando dependencias \n";
npm install;

echo "Ejecutando migraciones de esquema /n";
export DB_CONNECTION="postgres://$USUARIO:$PASS@localhost/cptn";
node node_modules/db-migrate/bin/db-migrate --config db/migraciones/database.json;

echo "Inicio nuevamente servicio cptnapi \n";
sudo service cptnapi start;