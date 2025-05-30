#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
REPO_URL="https://github.com/TU-COMPAÑERO/nombre-del-repo.git"
TARGET_DIR="07-realtime-notifs/20192183458"
CURRENT_DIR=$(pwd)

echo -e "${GREEN}Iniciando proceso de despliegue...${NC}"

# Crear directorio temporal
TEMP_DIR=$(mktemp -d)
echo "Directorio temporal creado: $TEMP_DIR"

# Clonar repositorio
echo "Clonando repositorio..."
git clone $REPO_URL $TEMP_DIR

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al clonar el repositorio${NC}"
    rm -rf $TEMP_DIR
    exit 1
fi

# Crear estructura de directorios
echo "Creando estructura de directorios..."
mkdir -p $TEMP_DIR/$TARGET_DIR

# Copiar archivos
echo "Copiando archivos..."
cp -r $CURRENT_DIR/* $TEMP_DIR/$TARGET_DIR/

# Navegar al directorio temporal
cd $TEMP_DIR

# Agregar cambios
echo "Agregando cambios a git..."
git add $TARGET_DIR

# Crear commit
echo "Creando commit..."
git commit -m "feat: Agregar proyecto de alertas en tiempo real (20192183458)"

# Subir cambios
echo "Subiendo cambios..."
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Despliegue completado con éxito!${NC}"
else
    echo -e "${RED}Error al subir los cambios${NC}"
fi

# Limpiar
echo "Limpiando archivos temporales..."
cd $CURRENT_DIR
rm -rf $TEMP_DIR

echo "Proceso finalizado." 