import {Sequelize} from 'sequelize';

// Example for different types of connection

const sequelizeUriSqlite = new Sequelize('sqlite::memory:');

const sequelizeUriPostgres = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const sequelizeParamsSqlite = new Sequelize({
    dialect: 'sqlite',
    storage: 'path/to/database.sqlite'
});

const sequelizeParamsMysql = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mssql'
});

export const sequelize = sequelizeUriSqlite;
