const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
        command: {
            user: String,
            content: Object,
            priceTotal: Number,
            status: String,
            file: Boolean,
            id: Number
        }
    },
    {collection: 'commands'}
);

const message = mongoose.model('Commands', userSchema)

module.exports = message