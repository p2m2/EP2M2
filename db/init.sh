#!/bin/bash

# Initialize the database
echo "Initializing the database..."

# Define password for user
psql -U postgres -c "ALTER USER $POSTGRESQL_USER WITH PASSWORD '$POSTGRESQL_PASSWORD';"
# Give all privileges to the user on the database
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $POSTGRESQL_DATABASE TO $POSTGRESQL_USER;"
# Initialize the database
psql -U $POSTGRESQL_USER -d $POSTGRESQL_DATABASE -f /usr/share/container-scripts/postgresql/start/init.sql

echo "Database initialization complete."