import {DataTypes} from 'sequelize';
import {sequelize} from "./connections";

const ShadowUser = sequelize.define(
    "ShadowUser",
    {
        shadowUserId: {
            type: DataTypes.UUID,
            primaryKey: true
        },
    },
    {}
);

const User = sequelize.define(
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
        lastName: {
            type: DataTypes.STRING,
            defaultValue: "Doe"
        },
        dataOfBirth: {
            type: DataTypes.DATEONLY
        },
        score: {
            type: DataTypes.DOUBLE
        },
        activated: {
            type: DataTypes.BOOLEAN
        },
        someCount: {
            type: DataTypes.INTEGER,
            autoIncrement: true
        },
        shadowId: {
            type: DataTypes.UUID,
            references: {
                model: ShadowUser,
                key: "shadowUserId"
            }
        },
        someRandomThing: DataTypes.TEXT
    },
    {
        indexes: [{unique: true, fields: ['userId']}]
    }
);

