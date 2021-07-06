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

//get a user's order
router.get('/get/userOrders/:userid', async (req, res) =>{
    try{

        const userOrder = await Order.find({user: req.params.userid}).populate('user', 'name').sort({'dateOrdered': -1});
        if(!userOrder) return res.status(404).send({success: false, message: 'user has not made any orders'});
        return res.status(200).send(userOrder);
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
//update status of order
router.put('/:id', async(req, res)=>{
    try{
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            }
        );
        if(!order) return res.status(400).send({success: false, message: 'invalid order'});
        return res.status(200).send(order);
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
});

//delete
router.delete('/:id', async(req, res)=>{
    try{
        const order = await Order.findByIdAndRemove(req.params.id)
            .then(async order => {
                if(order){
                    await order.orderItems.map(async orderItem =>{
                        await OrderItem.findByIdAndRemove(orderItem)
                    })
                    return res.status(200).send({success: true, message: 'the order item has been deleted'});
                } else{
                    return res.status(400).send({success: true, message: 'the order cannot be deleted'});
                }
            })

        if(!order) return res.status(400).send({success: false, message: 'invalid order'});
        return res.status(200).send({success: true, message: 'order has been deleted'});
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
});

router.post('/', async(req, res)=>{
    try{
        
        //creates an array of orderItems ID
        const orderItemIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {

            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product
            })
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        }))
        const orderItemsIdResolved = await orderItemIds;

        //return price array
        const totalPriceArray = await Promise.all(orderItemsIdResolved.map(async(orderItemId) =>{
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');

            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        }));

        //sum the price array
        const totalPrice = totalPriceArray.reduce((a,b)=>a+b, 0)

        let order = new Order({
            orderItems: orderItemsIdResolved, 
            shippingAddress: req.body.shippingAddress,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        order = await order.save();
        
        if(!order) return res.status(404).send({success: false, message: 'order cannot be created'})
        return res.status(200).send(order);
    }catch(err){
        return res.status(500).send({success: false, message: err.message});
    }
})

router.get('/get/totalSales', async (req, res)=>{
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalSales: {$sum: '$totalPrice'}}}
    ]);
    if(!totalSales) return res.status(400).send('The order sales cannot be generated')
    return res.status(200).send({totalSales: totalSales.pop().totalSales})
});

router.get('/get/count', async(req, res)=>{
    try{
        const orderCount = await Order.countDocuments((count)=>count);
        if(!orderCount) return res.status(500).json({success: false, message: 'no order'});

        return res.send({total: orderCount})
    }catch(err){
        return res.status(404).send({success: false,  message: err.message});
    }
});

module.exports = router;