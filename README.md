## PROJET HABILI PARIS ##

## Prérequis ##

- NodeJs v10.16.0 (version stable)
- npm v6.9.0 Version stable
- mySQL 5.6.43 Version stable

## Configuration ##

Importer le fichier bdd.sql dans mySQL

-----------------------------------

Modifier le fichier ./config.json

- baseUrl : domain_name_server

- db_conn : {
  host : host,
  user : utilisateur,
  password : mot_de_passe,
  database" : base_de_données
}

## Installation ##
à la racine

- npm install

## Lancement en daemon ##
- node app.js &
