#!/bin/bash
ACTION=$1
PR_NUMBER=$2
BRANCH_NAME=$3

EPHEMERAL_ROOT="/var/www/ephemeral/pr-${PR_NUMBER}"
CADDY_CONF_DIR="/var/www/caddy-ephemeral"
MAIN_REPO_DIR="/var/www/web-bytecode"
MAIN_ENV_FILE="${MAIN_REPO_DIR}/.env"

if [ -z "$ACTION" ] || [ -z "$PR_NUMBER" ]; then
    echo "Error: Faltan argumentos."
    exit 1
fi

echo "Ejecutando acción: $ACTION para el PR #${PR_NUMBER} en la rama: $BRANCH_NAME"

case "$ACTION" in
    opened|synchronize)
        echo "--> Creando/Actualizando entorno efímero..."
        mkdir -p /var/www/ephemeral

        # Sincronizar el repositorio base de producción con GitHub
        echo "--> Sincronizando ramas de GitHub en repositorio base..."
        cd "$MAIN_REPO_DIR"
        git config --global --add safe.directory "$MAIN_REPO_DIR"
        git fetch origin

        if [ ! -d "$EPHEMERAL_ROOT" ]; then
            echo "--> Clonando repositorio compartido en $EPHEMERAL_ROOT..."
            git clone --shared "$MAIN_REPO_DIR" "$EPHEMERAL_ROOT"
        fi

        # Asegurar que el origen del PR apunte a GitHub siempre (incluso si la carpeta ya existe)
        cd "$EPHEMERAL_ROOT"
        git remote set-url origin https://github.com/bytecode-web/web-bytecode.git

        git fetch origin "$BRANCH_NAME"
        git checkout -B "$BRANCH_NAME" "origin/$BRANCH_NAME" || git checkout "$BRANCH_NAME"
        git pull origin "$BRANCH_NAME"

        # Reutilizar credenciales si el .env ya existe para no romper la conexión con el volumen persistente de Postgres
        if [ -f "$EPHEMERAL_ROOT/.env" ]; then
            echo "--> Detectadas credenciales existentes..."
            DB_PASSWORD=$(grep -E "^DB_PASSWORD=" "$EPHEMERAL_ROOT/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
            JWT_SECRET_PR=$(grep -E "^JWT_SECRET=" "$EPHEMERAL_ROOT/.env" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
        else
            echo "--> Generando nuevas credenciales..."
            DB_PASSWORD=$(openssl rand -hex 16)
            JWT_SECRET_PR=$(openssl rand -hex 32)
        fi

        # Copiar las variables comunes de producción
        cp "$MAIN_ENV_FILE" "$EPHEMERAL_ROOT/.env"
        
        # Sobrescribir con las credenciales locales del PR
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" "$EPHEMERAL_ROOT/.env"
        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET_PR}/" "$EPHEMERAL_ROOT/.env"

        export PR_NUMBER DB_PASSWORD JWT_SECRET_PR
        set -a
        . "$EPHEMERAL_ROOT/.env"
        set +a

        echo "--> Levantando contenedores en Docker..."
        docker compose -p "pr-${PR_NUMBER}" -f docker-compose.ephemeral.yml up -d --build

        # Esperar a que la base de datos se inicialice por completo (el primer arranque toma unos segundos)
        echo "--> Esperando a que la base de datos esté lista..."
        sleep 8

        echo "--> Inicializando esquema base de datos..."
        docker compose -p "pr-${PR_NUMBER}" -f docker-compose.ephemeral.yml exec -T db psql -U bytecode_user -d "bytecode_pr_${PR_NUMBER}" < docs/database/postgresql_enterprise_schema.sql

        echo "--> Corriendo migraciones en la base de datos temporal..."
        docker compose -p "pr-${PR_NUMBER}" -f docker-compose.ephemeral.yml exec -T backend node apps/api/dist/db/migrate.js

        echo "--> Configurando subdominio dinámico en Caddy..."
        echo "pr${PR_NUMBER}.env.bytecode.com.pe {
    reverse_proxy bytecode-frontend-pr-${PR_NUMBER}:80
}
api-pr${PR_NUMBER}.env.bytecode.com.pe {
    reverse_proxy bytecode-backend-pr-${PR_NUMBER}:4000
}" > "${CADDY_CONF_DIR}/pr-${PR_NUMBER}.conf"

        echo "--> Recargando Caddy..."
        docker exec bytecode-proxy caddy reload --config /etc/caddy/Caddyfile

        echo "--> Notificando al Backend del nuevo despliegue..."
        # Leer JWT_SECRET limpiando comillas dobles y simples
        PROD_JWT_SECRET=$(grep -E "^JWT_SECRET=" "$MAIN_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
        
        curl -s -X POST https://api.bytecode.com.pe/api/webhooks/ephemeral-deploy \
          -H "Authorization: Bearer ${PROD_JWT_SECRET}" \
          -H "Content-Type: application/json" \
          -d "{\"branchName\": \"$BRANCH_NAME\", \"url\": \"https://pr${PR_NUMBER}.env.bytecode.com.pe\", \"apiUrl\": \"https://api-pr${PR_NUMBER}.env.bytecode.com.pe\", \"status\": \"deployed_ui\"}"

        echo "==> Entorno efímero listo en https://pr${PR_NUMBER}.env.bytecode.com.pe"
        ;;

    closed)
        echo "--> Eliminando entorno efímero para el PR #${PR_NUMBER}..."
        if [ -d "$EPHEMERAL_ROOT" ]; then
            cd "$EPHEMERAL_ROOT"
            export PR_NUMBER
            docker compose -p "pr-${PR_NUMBER}" -f docker-compose.ephemeral.yml down -v --rmi local
            cd /var/www
            rm -rf "$EPHEMERAL_ROOT"
        fi

        if [ -f "${CADDY_CONF_DIR}/pr-${PR_NUMBER}.conf" ]; then
            rm "${CADDY_CONF_DIR}/pr-${PR_NUMBER}.conf"
        fi

        docker exec bytecode-proxy caddy reload --config /etc/caddy/Caddyfile

        echo "--> Notificando al Backend de la desinstalación..."
        # Leer JWT_SECRET limpiando comillas
        PROD_JWT_SECRET=$(grep -E "^JWT_SECRET=" "$MAIN_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')

        curl -s -X POST https://api.bytecode.com.pe/api/webhooks/ephemeral-deploy \
          -H "Authorization: Bearer ${PROD_JWT_SECRET}" \
          -H "Content-Type: application/json" \
          -d "{\"branchName\": \"$BRANCH_NAME\", \"status\": \"destroyed\"}"

        echo "==> Entorno efímero eliminado con éxito."
        ;;
esac
