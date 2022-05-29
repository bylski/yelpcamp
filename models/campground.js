import mongoose from 'mongoose'
import Review from './review.js';
import User from './user.js';
const { Schema } = mongoose;
// Options - It enables having schema's virtuals when converting to JSON 
// (normally virtuals are not available)
const opts = { toJSON: { virtuals: true }}

const ImageSchema = new Schema ({
    path: String,
    filename: String,
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String, 
    images: [ ImageSchema ],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    }
}, opts);

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});


// Create PopUp For ClusterMap
CampgroundSchema.virtual('properties.popUp').get(function () {
    return `<a href="campgrounds/${this._id}"><h5><small>${this.title}</small></h5></a>
            <p style="margin-bottom: 0px">${this.description.substring(0, 60)}...</p>`
})


// Crop Images for Index Page
ImageSchema.virtual('cropIndex').get(function () {
    return this.path.replace('/upload', '/upload/w_400,h_265,c_fill')
})

// Crop Images for Show Page
ImageSchema.virtual('cropShow').get(function () {
    return this.path.replace('/upload', '/upload/w_720,h_480,c_fill')
})

// Create Thumbnails on Edit Page
ImageSchema.virtual('thumbnail').get(function () {
    return this.path.replace('/upload', '/upload/w_200,h_135')
})

export default mongoose.model('Campground', CampgroundSchema)
