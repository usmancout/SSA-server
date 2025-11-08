const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    location: { type: String },
    bio: { type: String },
    avatar: { type: String },
    isGoogleAccount: { type: Boolean, default: false },

    // New fields for user data
    searchHistory: [{
        query: String,
        category: String,
        timestamp: { type: Date, default: Date.now }
    }],

    wishlist: [{
        productId: String,
        name: String,
        brand: String,
        price: Number,
        originalPrice: Number,
        image: String,
        store: String,
        rating: Number,
        reviewCount: Number,
        description: String,
        dateAdded: { type: Date, default: Date.now }
    }],

    viewedProducts: [{
        productId: String,
        name: String,
        brand: String,
        price: Number,
        image: String,
        store: String,
        viewedAt: { type: Date, default: Date.now }
    }],

    activity: [{
        activityType: {  // Changed from 'type' to 'activityType' to avoid conflict
            type: String,
            enum: ['search', 'wishlist_add', 'wishlist_remove', 'product_view'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    recommendations: [{
        productId: String,
        name: String,
        brand: String,
        price: Number,
        image: String,
        store: String,
        reason: String
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
