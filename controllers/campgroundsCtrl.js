import express from 'express';
import { catchAsync, isLoggedIn, isAuthor, validateCampground } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import { campValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';
import flash from 'connect-flash';
import multer from 'multer';
import { cloudinary } from '../cloudinary/index.js';
import campground from '../models/campground.js';
import geocodingClient from '@mapbox/mapbox-sdk/services/geocoding.js'


const geocoder = geocodingClient({ accessToken:process.env.MAPBOX_TOKEN });

export async function renderIndex (req, res) {
    const campgrounds = await Campground.find({});
    
    res.render('campgrounds/index', { campgrounds });
};


export async function renderNewCampForm (req, res) {
    res.render('campgrounds/new');
};

export async function renderEditCamp (req, res) {
    const camp = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { camp });
}

export async function renderShowCamp (req, res, next) {
    const camp = await Campground
        .findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
    
    if (!camp) {
        req.flash('error', 'Cannot find such campground!')
        return res.redirect('/campgrounds')
    }
    // Get author of the campground
    const { author } = camp;
    res.render('campgrounds/show', { camp, author });
}


export async function addNewCamp (req, res) {
    const newCamp = new Campground(req.body);
    // Get GeoLocation Data form MapBox, based on camp's location
    const geoData =  await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    // Add GeoLocation Data from Mapbox to the DB
    newCamp.geometry = geoData.body.features[0].geometry;
    /// Get files passed by the user and add them to the 'images' of the campground in the DB
    newCamp.images = req.files.map(f => { return { path: f.path, filename: f.filename } })
    // Get current user and make him the author of the campground
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(`THIS IS YOUR NEW CAMP ${newCamp}`);
    req.flash('success', 'Successfully created a new campground!')
    res.redirect(`/campgrounds/${newCamp._id}`);
}

export async function editCamp (req, res) {
    const updatedCamp = req.body;
    // Update current camp with new body
    const currentCamp = await Campground.findByIdAndUpdate(req.params.id, req.body);
    // Add New Images to the edited campground
    const newImages = req.files.map(f => { return { path: f.path, filename: f.filename } })
    currentCamp.images.push(...newImages) 
    currentCamp.save(); // Save Changes
    // Delete "deletedImages" from the DB and from Cloudinary
    if (req.body.deletedImages) {
        await currentCamp.updateOne({ $pull: { images: { filename: {$in: req.body.deletedImages }}}})
        for (let filename of req.body.deletedImages) {
            cloudinary.uploader.destroy(filename);
        }
    
    }
    res.redirect(`/campgrounds/${currentCamp._id}`);
}

export async function deleteCamp (req, res) {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}