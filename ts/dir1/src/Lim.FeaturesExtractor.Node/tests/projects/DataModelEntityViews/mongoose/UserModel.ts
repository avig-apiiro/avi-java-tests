import mongoose, {Schema} from 'mongoose';

// local schema
const userSchema = new Schema({
    _id: Schema.Types.ObjectId,

    // using type constructor
    firstName: String,
    // using type name string
    // @ts-ignore: mongoose typing doesn't recognize denoting schema types by strings
    middleName: 'String',
    // using schema type object literal + schematype reference
    lastName: {type: Schema.Types.String, alias: 'surname'},

    // untyped array ('mixed' type)
    stuff: [],

    // array of primitive using schematype reference
    phoneNumbers: [mongoose.SchemaTypes.String],

    // nested paths
    primaryAddress: {
        streetNumber: String,
        city: String,
    },

    // array of nested paths
    children: [{
        name: String,
        age: Number
    }]
});

// model definition
mongoose.model('User', userSchema, "users");

// model reference
export const UserModel = mongoose.model('User');
