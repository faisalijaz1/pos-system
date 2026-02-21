#!/bin/sh
# Convert Railway DATABASE_URL to JDBC and set SPRING_DATASOURCE_URL for Spring Boot.
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    postgres://*) DATABASE_URL="postgresql://${DATABASE_URL#postgres://}";;
  esac
  export SPRING_DATASOURCE_URL="jdbc:${DATABASE_URL}"
fi
exec java -jar app.jar
