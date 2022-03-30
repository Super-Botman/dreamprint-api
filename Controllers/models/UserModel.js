const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
        user: {
            password: String,
            email: String,
            name: String,
            adress: String,
            token: String,
            changePassToken: String,
            role: String
        }
    },
    {collection: 'users'}
);

const message = mongoose.model('User', userSchema)

module.exports = message