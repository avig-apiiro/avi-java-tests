import {sequelize} from "../TsProject/dataModelsPlayground/sequelize/connections";

const IsSequelize = sequelize.define(
    'User',
    {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        someRandomThing: DataTypes.TEXT
    },
    {
        indexes: [{unique: true, fields: ['userId']}]
    }
);

const NotIsSequelize = sequelize.notDefine(
    'User',
    {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        someRandomThing: DataTypes.TEXT
    },
    {
        indexes: [{unique: true, fields: ['userId']}]
    }
);
