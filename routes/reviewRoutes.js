import express from 'express';
import { catchAsync, isLoggedIn, validateReview, isReviewAuthor } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { reviewValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';
import * as reviewCtrl from '../controllers/reviewCtrl.js';


// Define Router
const router = express.Router({ mergeParams: true })

// POST Route for adding new review for a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviewCtrl.addReview));

// DELETE Route for deleting Campground's review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewCtrl.deleteReview));

export default router;