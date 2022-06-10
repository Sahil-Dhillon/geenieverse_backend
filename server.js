import express from 'express';
import mongoose from 'mongoose'
// import { data } from './mainServicesData.js';
import dotenv from 'dotenv'
import ServiceRouter from './routers/servicesRouter.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
mongoose.connect('mongodb://localhost/ecommercewebapp')
app.get('/', (req, res) => {
    res.send('Server started successfully!')
})

// app.use(express.static('assets/images'))
app.use('/api/users', userRouter)
app.use('/api/services', ServiceRouter)
app.use('/api/orders', orderRouter);
// app.get('/api/services', (req, res) => {
//     res.send(data.services)
// })
app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message })
})
app.listen(5000, () => {
    console.log("server started at localhost:5000")
})