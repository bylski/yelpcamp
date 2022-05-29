import express from 'express';
import { catchAsync, isLoggedIn } from '../utils/middleware.js';
import Campground from '../models/campground.js';
import Review from '../models/review.js';
import { reviewValidationSchema } from '../schemas.js';
import { ExpressError } from '../utils/ExpressError.js';
import passport from 'passport';
import User from '../models/user.js'
import LocalStrategy from 'passport-local'

export function renderRegisterForm (req, res) {
    res.render('user/register');
}

export async function registerNewUser (req, res, next) {
    try {
        const { username, email, password } = req.body;
        // Create new User and then register him with his password, pass data to the DB
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', "Welcome to YelpCamp!")
            res.redirect('/campgrounds')
        }); 
    }
    catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

export function renderLoginForm (req, res) {
    res.render('user/login');
};

export async function logIn(req, res) {
    // If Logged In Successfully:
    req.flash('success', "Logged In!")
    // If there is no last visited page to return go to /campgrounds
    const redirectTo = req.session.returnTo;
    delete req.session.returnTo;
    if(!redirectTo) return res.redirect('/campgrounds')
    // And if there is, return to it
    res.redirect(redirectTo);
}

export function logOut (req, res){
    req.logout();
    req.flash('success', "We hope to see you again!")
    res.redirect('/')
}