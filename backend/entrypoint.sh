#!/bin/sh
# entrypoint.sh — Convert Railway DATABASE_PUBLIC_URL to JDBC URL for Spring Boot

# Only run if DATABASE_PUBLIC_URL is defined
if [ -n "$DATABASE_PUBLIC_URL" ]; then
  # Replace 'postgres://' with 'postgresql://' if needed
  case "$DATABASE_PUBLIC_URL" in
    postgres://*) 
      DATABASE_PUBLIC_URL="postgresql://${DATABASE_PUBLIC_URL#postgres://}"
      ;;
  esac

  # Prepend 'jdbc:' for Spring Boot JDBC
  export SPRING_DATASOURCE_URL="jdbc:${DATABASE_PUBLIC_URL}"

  # Optional: split user/password (Spring Boot can auto-detect from JDBC, but explicit is safer)
  # Extract username and password from URL
  DB_USER=$(echo "$DATABASE_PUBLIC_URL" | sed -n 's#postgresql://\([^:]*\):.*@.*#\1#p')
  DB_PASSWORD=$(echo "$DATABASE_PUBLIC_URL" | sed -n 's#postgresql://[^:]*:\([^@]*\)@.*#\1#p')
  export SPRING_DATASOURCE_USERNAME=$DB_USER
  export SPRING_DATASOURCE_PASSWORD=$DB_PASSWORD
fi

# Start Spring Boot application
exec java -jar app.jar