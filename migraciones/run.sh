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
    pg_dump -d $DB -U $USUARIO -F c -f "./backup"
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/01. added.sql"
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/02. pre_change.sql"
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/03. changes.sql"
    psql -d $DB -U $USUARIO -f "./migraciones/$FECHA/04. post_change.sql"
else
    echo "El argumento -f | --fecha es obligatorio!"
    echo "Argumentos:"
    echo "-f | --fecha"
    echo "-u | --usuario"
    echo "-d | --database"
fi