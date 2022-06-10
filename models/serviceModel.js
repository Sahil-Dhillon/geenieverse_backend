import mongoose from 'mongoose'
const servicesServiceSchema = new mongoose.Schema(
    {
        // _id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        image: { type: Number, required: false },
        details: { type: String },
        availability: { type: Boolean, required: true },
    },
    {
        timestamps: true
    }
)

const servicesSubGroupSchema = new mongoose.Schema(
    {
        // _id: { type: Number, required: true, unique: true },
        item: { type: String, required: true, unique: true },
        services: { type: [servicesServiceSchema], required: true },
    },
    {
        timestamps: true
    }
)

const servicesGroupSchema = new mongoose.Schema(
    {
        // _id: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        imgLink: { type: String, required: true },
        details: { type: Array, required: true },
        options: { type: [servicesSubGroupSchema], required: false }
    },
    {
        timestamps: true
    }
)

const Service = mongoose.model('Service', servicesGroupSchema)
export default Service