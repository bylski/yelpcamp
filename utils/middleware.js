import Campground from '../models/campground.js'
import Review from '../models/review.js'
import { ExpressError } from '../utils/ExpressError.js'
import { campValidationSchema, reviewValidationSchema } from '../schemas.js';



export function catchAsync(func) {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

export function isLoggedIn(req, res, next) {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// Check if the current user is an autor of the campground
export async function isAuthor(req, res, next) {
    const camp = await Campground.findById(req.params.id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', "You don't have permissions to do that!");
        return res.redirect('/campgrounds');
    }
    next();
}

// Check if the current user is the author of the Review
export async function isReviewAuthor(req, res, next) {
    const { campId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "You don't have permissions to do that!");
        return res.redirect(`/campgrounds/${ campId }`);
    }
    next();
}

// Server-Side Campground Data Validation Function 
export function validateCampground(req, res, next) {

    const { error } = campValidationSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

export function validateReview(req, res, next) {

    const { error } = reviewValidationSchema.validate(req.body.review);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

