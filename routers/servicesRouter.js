import express from "express";
import expressAsyncHandler from "express-async-handler";
import { data } from "../mainServicesData.js";
import Service from "../models/serviceModel.js";
import { isAdmin, isAuth } from "../utils.js";

const ServiceRouter = express.Router()
ServiceRouter.get('/', expressAsyncHandler(async (req, res) => {
    const services = await Service.find({})
    res.send(services)
}))

ServiceRouter.post('/add/group', expressAsyncHandler(async (req, res) => {
    const serviceGroup = new Service({
        title: "Sample Title",
        imgLink: "https://source.unsplash.com/random/200x100",
        details: ["Sample Service 1", "Sample Service 2"],
        options: []
    })
    const createdServiceGroup = await serviceGroup.save();
    res.send({ message: "Service Group Added", serviceGroup: createdServiceGroup })
}))

ServiceRouter.put('/add/service/:group/:subgroup', expressAsyncHandler(async (req, res) => {

    const data = await Service.findOne({ title: req.params.group })
    // const groupFilter = await data.find((x) => x.title === req.params.group);
    const subGroupFilter = await data.options.find((x) => x.item === req.params.subgroup);
    const servicesFiltered = await subGroupFilter.services
    servicesFiltered.push({
        name: req.body.name,
        price: req.body.price,
        details: req.body.details,
        availability: req.body.availability
    })
    await data.save()
    if (servicesFiltered) {
        res.send(servicesFiltered);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}))

ServiceRouter.get('/seed', expressAsyncHandler(async (req, res) => {
    await Service.remove()
    const createdService = await Service.insertMany(data.services)
    res.send({ createdService })
}))
ServiceRouter.get('/:group/:subgroup', expressAsyncHandler(async (req, res) => {
    const data = await Service.find({})
    const groupFilter = await data.find((x) => x.title === req.params.group);
    const subGroupFilter = await groupFilter.options.find((x) => x.item === req.params.subgroup);
    const servicesFiltered = await subGroupFilter.services
    if (servicesFiltered) {
        res.send(servicesFiltered);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}))
ServiceRouter.get('/:group/:subgroup/:service', expressAsyncHandler(async (req, res) => {
    const data = await Service.findOne({ title: req.params.group })
    // const groupFilter = await data.find((x) => x.title === req.params.group);
    const subGroupFilter = await data.options.find((x) => x.item === req.params.subgroup);
    const servicesFiltered = await subGroupFilter.services.find((x) => x.name === req.params.service);
    if (servicesFiltered) {
        res.send(servicesFiltered);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }

}))
// app.get('/api/services/:group/:subgroup/:service', (req, res) => {
// });
export default ServiceRouter