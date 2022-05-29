import express from 'express';
import { catchAsync, isLoggedIn, isAuthor, validateCampground } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import { campValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';
import flash from 'connect-flash';
import * as campgroundsCtrl from '../controllers/campgroundsCtrl.js';
import multer from 'multer';
import { cloudinary, storage } from '../cloudinary/index.js'

const upload = multer({ storage }); // Pass Cloudinary Storage to Multer Storage

// Define Router
const router = express.Router({ mergeParams: true })

// '/' Routes
router.route('/')
    .get(catchAsync(campgroundsCtrl.renderIndex)) // Render Home Page
    .post(isLoggedIn, upload.array('images'), validateCampground, catchAsync(campgroundsCtrl.addNewCamp)); // Add New Camp to the DB

// GET Route for showing new campground creation page
router.get('/new', isLoggedIn, campgroundsCtrl.renderNewCampForm);

// GET Route for showing edit page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundsCtrl.renderEditCamp));

// PATCH Route for Updating Campgrounds
router.patch('/:id/edit', isLoggedIn, isAuthor, upload.array('images'), validateCampground, catchAsync(campgroundsCtrl.editCamp));

// ':id' Routes
router.route('/:id')
    .get(catchAsync(campgroundsCtrl.renderShowCamp)) 
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundsCtrl.deleteCamp));

export default router;

