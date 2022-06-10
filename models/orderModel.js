import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
    orderItems: [{
        name: { type: String, required: true },
        group: { type: String, required: true },
        subgroup: { type: String, required: true },
        timeSlot: { type: String, required: true },
        comment: { type: String, required: false },
        image: { type: String, required: false },
        price: { type: Number, required: true },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
    }, ],
    serviceAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        address2: { type: String, required: false },
        city: { type: String, required: true },
        state: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    servicesPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: String },
    paymentStatus: {
        bankName: { type: String },
        bankTxnId: { type: String },
        checksumhash: { type: String },
        currency: { type: String },
        gatewayName: { type: String },
        mid: { type: String },
        orderID: { type: String },
        paymentMode: { type: String },
        respCode: { type: String },
        respMsg: { type: String },
        status: { type: String },
        txnAmount: { type: String },
        txnDate: { type: String },
        txnId: { type: String }
    },
    isServed: { type: Boolean, default: false },
    ServedAt: { type: String },
}, {
    timestamps: true,
});
const Order = mongoose.model('Order', orderSchema);
export default Order;