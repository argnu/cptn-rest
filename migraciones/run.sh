#!/bin/bash

USUARIO=$USER
DB="cptn"

while [ "$1" != "" ]; do
    case $1 in
        -f | --fecha )           shift
                                FECHA=$1
                                ;;
        -u | --usuario )        shift
                                USUARIO=$1
                                ;;
        -d | --database)        shift
                                DB=$1
    esac
    shift
done

if [ "$FECHA" != "" ] && [ "$FECHA" != "" ] && [ "$FECHA" != "" ]
then
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/positivos.sql"
    node "./migraciones/$FECHA/migracion.js"
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/negativos.sql"
else
    echo "El argumento -f | --fecha es obligatorio!"
    echo "Argumentos:"
    echo "-f | --fecha"
    echo "-u | --usuario"
    echo "-d | --database"
fi