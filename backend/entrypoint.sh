#!/bin/sh
# Convert Railway DATABASE_URL to JDBC and set SPRING_DATASOURCE_URL for Spring Boot.
if [ -n "$DATABASE_PUBLIC_URL" ]; then
  case "$DATABASE_PUBLIC_URL" in
    postgres://*) DATABASE_PUBLIC_URL="postgresql://${DATABASE_PUBLIC_URL#postgres://}";;
  esac
  export SPRING_DATASOURCE_URL="jdbc:${DATABASE_PUBLIC_URL}"
fi
exec java -jar app.jar
