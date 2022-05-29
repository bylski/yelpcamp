import mongoose from 'mongoose';
import Campground from '../models/campground.js';
import cities from './cities.js';
import {descriptors, places} from './seedHelpers.js';
import imgSeedsArr from './imgs.js';

// Connecting to MongooseDB
mongoose.connect('mongodb://localhost:27017/YelpCamp');
// Catching Connection Errors
 const db = mongoose.connection;
 db.on("error", console.error.bind(console, "connection error:"));
 db.once("open", () => {
     console.log("Database Connected");
 })

// Function to get a random array from a collection,
// later used in 'seedDB'
const randomArr = arr => arr[Math.floor(Math.random() * arr.length)];

const randomImages = () => {
    const randomImgArr = [];
// Seed random Imgs for Campgrounds
    for (let i = 0; i < 3; i++) {
        const randomImg = randomArr(imgSeedsArr);
        if (!randomImgArr.includes(randomImg)) {
            randomImgArr.push(randomImg);
        } else { 
            i--;
         }
    }

    return randomImgArr;
}
 // Function to create random database entries
 const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        // Create random number and access random city object
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 20 + 10);
        const {city, state, latitude, longitude} = cities[random1000];
        const randomTitle = `${randomArr(descriptors)} ${randomArr(places)}`
        const randomImgs = randomImages();
        console.log(randomImgs)
        const camp = new Campground({
            location: `${city}, ${state}`,
            title: randomTitle,
            price: randomPrice,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi delectus debitis molestiae temporibus cum? Temporibus voluptatibus corrupti quo optio? Dolorum quis nemo minima, eos illo quo laboriosam officia ea est!',
            images: randomImgs,
            author: '6282850ed660de5a481f957f',
            geometry: { type: 'Point', coordinates: [ longitude, latitude ] },
        })
        await camp.save();
    }
 } 

const showDB = async () => {
    console.log(await Campground.find({}));
}

 seedDB();
// showDB();