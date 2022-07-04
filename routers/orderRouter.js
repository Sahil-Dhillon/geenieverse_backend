import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { isAuth } from '../utils.js';
import PaytmChecksum from 'paytmchecksum'
import https from 'https'
import axios from 'axios';

const orderRouter = express.Router();
orderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        if (req.body.orderItems.length === 0) {
            res.status(400).send({ message: 'Cart is empty' });
        } else {
            const order = new Order({
                orderItems: req.body.orderItems,
                serviceAddress: req.body.serviceAddress,
                paymentMethod: req.body.paymentMethod,
                servicesPrice: req.body.servicesPrice,
                taxPrice: req.body.taxPrice,
                totalPrice: req.body.totalPrice,
                user: req.user._id,
            });
            const createdOrder = await order.save();
            res
                .status(201)
                .send({ message: 'New Order Created', order: createdOrder });
        }
    })
);

orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.send(order);
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

orderRouter.get(
    '/config/paytm',
    isAuth,
    (req, res) => {
        res.send(process.env.PAYTM_MERCHANT_ID || "MID NOT FOUND")
    })

orderRouter.post(
    '/initiateTransaction/:id',
    // isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const user = await User.findById(order.user)
        if (order) {
            var paytmParams = {};
            paytmParams.body = {
                "requestType": "Payment",
                "mid": process.env.PAYTM_MERCHANT_ID,
                "websiteName": "WEBSTAGING",
                "orderId": req.params.id,
                "callbackUrl": "http://localhost:3000/orderStatus",
                // "callbackUrl": "https://zsahildhillon.web.app/api/callback",
                "txnAmount": {
                    "value": order.totalPrice,
                    "currency": "INR",
                },
                "userInfo": {
                    "custId": order.user,
                    "email": user.email
                },
            }
            PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {
                paytmParams.head = {
                    "signature": checksum
                }
                var post_data = JSON.stringify(paytmParams);
                var options = {
                    /* for Staging */
                    hostname: 'securegw-stage.paytm.in',
                    /* for Production */
                    // hostname: 'securegw.paytm.in',
                    port: 443,
                    path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${req.params.id}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };
                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk.toString();
                    });
                    post_res.on('end', function () {
                        console.log('Response:---- ', response);
                        res.send(response)
                    });
                    // console.log(post_res)
                });
                post_req.write(post_data);
                // res.send(response)
                post_req.end();
            })
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
)

orderRouter.post(
    '/initiateTransactionApp/:id',
    // isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        const user = await User.findById(order.user)
        if (order) {
            var paytmParams = {};
            paytmParams.body = {
                "requestType": "Payment",
                "mid": process.env.PAYTM_MERCHANT_ID,
                "websiteName": "WEBSTAGING",
                "orderId": req.params.id,
                "callbackUrl": `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${req.params.id}`,
                "txnAmount": {
                    "value": order.totalPrice,
                    "currency": "INR",
                },
                "userInfo": {
                    "custId": order.user,
                    "email": user.email
                },
            }
            PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function (checksum) {
                paytmParams.head = {
                    "signature": checksum
                }
                var post_data = JSON.stringify(paytmParams);
                var options = {
                    /* for Staging */
                    hostname: 'securegw-stage.paytm.in',
                    /* for Production */
                    // hostname: 'securegw.paytm.in',
                    port: 443,
                    path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MERCHANT_ID}&orderId=${req.params.id}`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };
                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk.toString();
                    });
                    post_res.on('end', function () {
                        console.log('Response:---- ', response);
                        res.send(response)
                    });
                    // console.log(post_res)
                });
                post_req.write(post_data);
                // res.send(response)
                post_req.end();
            })
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
)

orderRouter.post('/:id/transactionStatus')
orderRouter.put(
    '/:id/PaymentStatus',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const date = new Date;
        const order = await Order.findById(req.params.id);
        const paytmChecksum = req.body.CHECKSUMHASH;
        delete req.body.CHECKSUMHASH;

        var isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.PAYTM_MERCHANT_KEY, paytmChecksum);
        if (isVerifySignature) {
            console.log("Checksum Matched");
        } else {
            console.log("Checksum Mismatched");
        }
        if (order && isVerifySignature) {
            if (req.body.STATUS == "TXN_SUCCESS") {
                order.isPaid = true;
                order.paidAt = date.toLocaleDateString() + " " + date.toLocaleTimeString();
            }
            order.paymentStatus = {
                bankName: req.body.BANKNAME,
                bankTxnId: req.body.BANKTXNID,
                checksumhash: req.body.CHECKSUMHASH,
                currency: req.body.CURRENCY,
                gatewayName: req.body.GATEWAYNAME,
                mid: req.body.MID,
                orderID: req.body.ORDERID,
                paymentMode: req.body.PAYMENTMODE,
                respCode: req.body.RESPCODE,
                respMsg: req.body.RESPMSG,
                status: req.body.STATUS,
                txnAmount: req.body.TXNAMOUNT,
                txnDate: req.body.TXNDATE,
                txnId: req.body.TXNID
            };
            const updatedOrder = await order.save();
            console.log(updatedOrder)
            res.send(updatedOrder);
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);

orderRouter.get(
    '/generateCheckSumHash/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            const body = { "mid": process.env.PAYTM_MERCHANT_ID, "orderId": req.params.id }
            var paytmChecksum = PaytmChecksum.generateSignature(body, process.env.PAYTM_MERCHANT_KEY);
            paytmChecksum.then(function (result) {
                console.log("generateSignature Returns: " + result);
                res.send(result)
            }).catch(function (error) {
                console.log(error);
            });
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    })
);


orderRouter.get(
    '/user/history',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find({ user: req.user._id });
        if (orders) {
            res.send(orders);
        } else {
            res.status(404).send({ message: 'No orders found.' })
        }
    })
);
/*
orderRouter.get('/paytmCallback/:id',expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {

        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }
    }))*/

export default orderRouter;
