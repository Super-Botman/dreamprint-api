const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
        item: {
            user: String,
            name: String,
            description: String,
            price: Number,
            id: String
        }
    },
    {collection: 'cart'}
);

const message = mongoose.model('Item', userSchema)

module.exports = message