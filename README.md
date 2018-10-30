# webjive-auth

Create a .env file and mount it as a volume in the docker-compose file, containing the following entries:

    LDAP_CREDENTIALS=
    LDAP_URL=
    LDAP_BIND=

Build and run:

    $ docker-compose build
    $ docker-compose up

Todo:

* Persistence in Redis (mount volume)
