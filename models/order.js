const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true
        }
    ],
    shippingAddress: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'pending'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateOrdered: {
        type: Date,
        default: Date.now
    }
});

//transforms _Id set by mongoose to a more readable form for frontend
orderSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
//use the virtual that was set up
orderSchema.set('toJSON', {
    virtuals: true
})

module.exports.Order = mongoose.model('Order',orderSchema)