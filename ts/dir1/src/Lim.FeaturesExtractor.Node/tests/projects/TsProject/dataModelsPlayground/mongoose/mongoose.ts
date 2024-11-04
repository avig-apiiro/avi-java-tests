import mongoose, {Schema} from 'mongoose';

const userSchema = new Schema({
    _id: Schema.Types.ObjectId,

    // using type constructor
    firstName: String,
    // using type name string
    middleName: 'String',
    // using schema type object
    lastName: {type: String, alias: 'surname'},

    // untyped array ('mixed' type)
    stuff: [],

    // array of primitive
    phoneNumbers: [String],

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

export const User = mongoose.model('User', userSchema);
