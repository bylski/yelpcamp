import express from 'express';
import { catchAsync, isLoggedIn, validateReview, isReviewAuthor } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { reviewValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';

export async function addReview (req, res) {   
    try {   
            if (req.body.review.rating == 0) {
                throw new Error('You must choose your rating first!');
            }
            const newReview = new Review(req.body.review);
            // Add author of the Review to the Review Document
            newReview.author = req.user._id;
            const campground = await Campground.findById(req.params.campId);
            campground.reviews.push(newReview);
            await newReview.save();
            await campground.save();
        req.flash('success', 'Successfully added new review!')
        res.redirect(`/campgrounds/${req.params.campId}`);
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect(`/campgrounds/${req.params.campId}`);
    }
}

export async function deleteReview (req, res) {
    const { campId, reviewId } = req.params;
    await Campground.findByIdAndUpdate(
        campId,
        { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully')
    res.redirect(`/campgrounds/${campId}`);
}