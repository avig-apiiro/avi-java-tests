import {DataTypes, Model} from 'sequelize';
import {sequelize} from "./connections";

class Account extends Model {
}

Account.init(
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
    },
    {
        // Other model options go here
        sequelize,
        modelName: 'Account',
        indexes: [{unique: true, fields: ['userId']}]
    });

class OtherAccount extends Model {
}

OtherAccount.init(
    {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true
        },
    },
    {
        // Other model options go here
        sequelize,
    });
