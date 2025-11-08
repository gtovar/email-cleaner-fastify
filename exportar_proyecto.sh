#!/bin/bash

# Nombre del archivo de salida completo
OUTPUT_FILE="proyecto_completo.txt"

# Borrar archivo anterior si existe
> "$OUTPUT_FILE"

# Obtener nombre del script para excluirlo
SCRIPT_NAME=$(basename "$0")

echo "Generando archivo completo..."

# Recorrer todos los archivos del proyecto, excluyendo carpetas innecesarias
find . -type f \
    ! -path "./log/*" \
    ! -path "./node_modules/*" \
    ! -path "./tmp/*" \
    ! -path "./vendor/*" \
    ! -path "./storage/*" \
    ! -path "./public/*" \
    ! -path "./.git/*" \
    ! -path "./venv/*" \
    ! -path "*/venv/*" \
    ! -path "*/.venv/*" \
    ! -path "*/__pycache__/*" \
    ! -name "*.css" \
    ! -name "*.png" \
    ! -name "*.jpg" \
    ! -name "*.jpeg" \
    ! -name "*.gif" \
    ! -name "*.svg" \
    ! -name "*.pyc" \
    ! -name "*.pyo" \
    ! -name "*.pyd" \
    ! -name ".DS_Store" \
    ! -name ".zip" \
    ! -name "*.swp" \
    ! -name "*.swo" \
    ! -name "*.tmp" \
    ! -name "*.bak" \
    ! -name "*.sqlite" \
    ! -name "*.sqlite3" \
    ! -name ".env.production" \
    ! -name ".env.development" \
    ! -name "$SCRIPT_NAME" \
    ! -name "$OUTPUT_FILE" | while read -r file; do
    echo "=== INICIO: $file ===" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n=== FIN: $file ===\n" >> "$OUTPUT_FILE"
done


echo "Archivo generado: $OUTPUT_FILE"

# Ahora dividir el archivo en partes de 200 líneas
echo "Dividiendo archivo en partes pequeñas de 200 líneas..."
split -l 200 -a 2 -d "$OUTPUT_FILE" "proyecto_parte_"


