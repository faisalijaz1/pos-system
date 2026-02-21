#!/bin/sh
# Convert internal DATABASE_URL to JDBC for Spring Boot

if [ -n "$DATABASE_URL" ]; then
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

  # Set Spring Boot variables
  export SPRING_DATASOURCE_URL="jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
  export SPRING_DATASOURCE_USERNAME="$DB_USER"
  export SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"
fi

exec java -jar app.jar