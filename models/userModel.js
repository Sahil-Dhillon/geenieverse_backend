import mongoose from 'mongoose'


const savedAddress = mongoose.Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: Number, required: true },
        address: { type: String, required: true },
        address2: { type: String, required: false },
        city: { type: String, required: true },
        state: { type: String, required: true },
    }
)

const cartItems = mongoose.Schema(
    {
        // id:{type: String, required: true, unique:true},
        name: { type: String, required: true },
        group: { type: String, required: true },
        subgroup: { type: String, required: true },
        timeSlot: { type: String, required: true },
        comment: { type: String, required: false },
        image: { type: String, required: false },
        price: { type: Number, required: true },
        serviceId: {
            type: String,
            required: false,
        }
    }
)
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, },
        isAdmin: { type: Boolean, default: false, required: true },
        savedAddress: {
            type: [savedAddress], required: false,
        },
        cartItems: {
            type: [cartItems],
            required: false
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model('User', userSchema)

export default User