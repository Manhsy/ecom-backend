const express = require('express');
const router = express.Router();
const {Order} = require('../models/order');
const {User} = require('../models/user');
const {OrderItem} = require('../models/orderItem');
const {Product} = require('../models/product');

router.get('/', async (req, res) =>{
    try{
        const orders = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
        if(!orders) return res.status(404).send({success: false, message: 'no orders to be returned'});
        return res.status(200).send(orders);
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
});
//get one order based with populated fields of user, orderItems, and category of the products 
router.get('/:id', async (req, res) =>{
    try{
        const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }});
        if(!order) return res.status(404).send({success: false, message: 'invalid order'});
        return res.status(200).send(order);
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
});

router.post('/', async(req, res)=>{
    try{
        // const user = await User.findById(req.body.user);
        // if(!user) return res.status(400).send({success: false, message: 'invalid user'});
        
        //creates an array of orderItems ID
        const orderItemIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
            // const product = await Product.findById(req.body.user);
            // if(!product) return res.status(400).send({success: false, message: 'invalid product'});
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        }))
        const orderItemsIdResolved = await orderItemIds;

        let order = new Order({
            orderItems: orderItemsIdResolved, 
            shippingAddress: req.body.shippingAddress,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: req.body.totalPrice,
            user: req.body.user,
        });

        order = await order.save();
        
        if(!order) return res.status(404).send({success: false, message: 'order cannot be created'})
        return res.status(200).send(order);
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
})

module.exports = router;