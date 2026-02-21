#!/bin/sh
# Convert Railway database variables to Spring Boot format

# If DATABASE_URL exists (older Railway format)
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL format"
  # DATABASE_URL example: postgresql://user:pass@host:port/db
  # Strip 'postgresql://'
  url_no_proto="${DATABASE_URL#postgresql://}"

  # Extract user:pass and host:port/db
  userpass="${url_no_proto%@*}"
  hostdb="${url_no_proto#*@}"

  DB_USER="${userpass%%:*}"
  DB_PASSWORD="${userpass#*:}"

  DB_HOST="${hostdb%%/*}"
  DB_NAME="${hostdb#*/}"

  DB_PORT=5432  # default
  if echo "$DB_HOST" | grep -q ":"; then
    DB_PORT="${DB_HOST#*:}"
    DB_HOST="${DB_HOST%%:*}"
  fi

# If using newer Railway PG variables
elif [ -n "$PGHOST" ] && [ -n "$PGDATABASE" ]; then
  echo "Using PGHOST/PGDATABASE format"
  DB_HOST="$PGHOST"
  DB_PORT="${PGPORT:-5432}"
  DB_NAME="$PGDATABASE"
  DB_USER="$PGUSER"
  DB_PASSWORD="$PGPASSWORD"
  
# If using Railway's standard variable names
elif [ -n "$DATABASE_HOST" ] && [ -n "$DATABASE_NAME" ]; then
  echo "Using DATABASE_HOST/DATABASE_NAME format"
  DB_HOST="$DATABASE_HOST"
  DB_PORT="${DATABASE_PORT:-5432}"
  DB_NAME="$DATABASE_NAME"
  DB_USER="$DATABASE_USERNAME"
  DB_PASSWORD="$DATABASE_PASSWORD"
  
else
  echo "No database environment variables found. Using defaults or existing SPRING_* variables."
fi

# Set Spring Boot variables if we extracted values
if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; then
  echo "Setting database connection to: $DB_HOST:$DB_PORT/$DB_NAME"
  
  # Add SSL requirement for Railway
  export SPRING_DATASOURCE_URL="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME?ssl=true&sslmode=require"
  export SPRING_DATASOURCE_USERNAME="$DB_USER"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"
  
  echo "SPRING_DATASOURCE_URL set to: $SPRING_DATASOURCE_URL"
fi

# Print environment for debugging (remove in production)
echo "SPRING_DATASOURCE_USERNAME: $SPRING_DATASOURCE_USERNAME"
echo "SPRING_DATASOURCE_URL: $SPRING_DATASOURCE_URL"

exec java -jar app.jar