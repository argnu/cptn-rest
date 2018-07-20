#!/bin/bash

BRANCH='develop'

if [ $1 = "prod" ]; then
    BRANCH = 'master'
fi

echo "Parando servicio cptnapi \n";
sudo service cptnapi stop;

echo "Actualizando repositorio \n";
git checkout $BRANCH;
git pull;

echo "Instalando dependencias \n";
npm install;

echo "Ejecutando migraciones de esquema /n";
npm run migrate up;

echo "Inicio nuevamente servicio cptnapi \n";
sudo service cptnapi start;