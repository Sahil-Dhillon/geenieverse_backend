import express from "express";
import expressAsyncHandler from "express-async-handler";
import { data } from "../mainServicesData.js";
import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import { generateToken, isAuth } from "../utils.js";
const UserRouter = express.Router()

UserRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    await User.remove({})
    const createdUser = await User.insertMany(data.users)
    res.send({ createdUser })
}))

UserRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            res.send(
                {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    savedAddress: user.savedAddress,
                    cart: user.cartItems,
                    token: generateToken(user)
                }
            )
            return
        }
    }
    res.status(401).send({ message: 'Invalid email or password' })
}))
UserRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    })
    const createdUser = await user.save()
    res.send(
        {
            _id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            isAdmin: createdUser.isAdmin,
            savedAddress: createdUser.savedAddress,
            cart: createdUser.cartItems,
            token: generateToken(createdUser)
        }
    )

}))
UserRouter.get('/currentUser', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    if (user) {
        res.send(user)
    }
    else {
        res.status(401).send("User not found")
    }
}))

UserRouter.put(
    '/profile',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 8);
            }
            const updatedUser = await user.save();
            res.send({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser),
            });
        }
    })
);

UserRouter.put('/saveAddress', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    // const user = await User.findOne({ email: req.body.email })
    if (user) {
        user.savedAddress.push({
            fullName: req.body.fullName,
            phone: req.body.phone,
            address: req.body.address,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
        })
        await user.save()
        // await address.save();
        res.status(201).send(user);
    }
}))
UserRouter.delete('/removeSavedAddress/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    // const user = await User.findOne({ email: req.body.email })
    const removedItem = req.params.id
    if (user) {
        user.savedAddress = await user.savedAddress.filter((x) => x._id != removedItem);
        await user.save()
        res.status(201).send(user);
    } else {
        res.status(401).send("User not found")
    }
}))
UserRouter.put('/addToCart', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    // const user = await User.findOne({ email: req.body.email })
    if (user) {
        user.cartItems.push({
            name: req.body.name,
            group: req.body.group,
            subgroup: req.body.subgroup,
            timeSlot: req.body.timeSlot,
            comment: req.body.comment,
            price: req.body.price,
            image: req.body.img,
            serviceId: req.body.serviceId,
        })
        await user.save()
        // await address.save();
        res.status(201).send(user);
    } else {
        res.status(401).send("User not found")
    }
}))
UserRouter.delete('/removeFromCart/:id', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    // const user = await User.findOne({ email: req.body.email })
    const removedItem = req.params.id
    if (user) {
        user.cartItems = await user.cartItems.filter((x) => x._id != removedItem);
        await user.save()
        res.status(201).send(user);
    } else {
        res.status(401).send("User not found")
    }
}))
UserRouter.delete('/emptyCart', isAuth, expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    // const user = await User.findOne({ email: req.body.email })
    if (user) {
        user.cartItems = []
        await user.save()
        res.status(201).send(user);
    } else {
        res.status(401).send("User not found")
    }
}))
export default UserRouter