const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity:{
        type: Number,
        required: true
    }
});

module.exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);
