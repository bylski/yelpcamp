import express from 'express';
import { catchAsync, isLoggedIn } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { reviewValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';
import passport from 'passport';
import User from '../models/user.js';
import LocalStrategy from 'passport-local';
import * as userCtrl from '../controllers/userCtrl.js';


const router = express.Router({ mergeParams: true });

// GET Route for displaying user registration HTML
router.route('/register')
    .get(userCtrl.renderRegisterForm) // Render Register Form Page
    .post(catchAsync(userCtrl.registerNewUser)); // Add New User to the DB

// GET Route for displaying user log in HTML
router.route('/login')
    .get(userCtrl.renderLoginForm) // Render Login Form Page
    .post(passport.authenticate('local',
    { failureRedirect: '/login', failureFlash: true }), userCtrl.logIn); // Log In if authenticated

router.get('/logout', userCtrl.logOut)

export default router;