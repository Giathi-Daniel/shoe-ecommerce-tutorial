const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            validate: {
                validator: function(email) {
                    return validator.isEmail(email) && email.endsWith('@gmail.com')
                },
                message: 'Must be a valid Gmail address',
            },
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
    },
    {
        timestamps: true,
    }
);

// hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// compare raw password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
module.exports = User;