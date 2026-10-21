const mongoose = require('mongoose');

const CATEGORIES = ['men', 'women', 'kids', 'sports', 'casual', 'formal'];

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    compareAtPrice: { type: Number, min: 0, default: 0 },
    category: { type: String, required: true, enum: CATEGORIES },
    mainImage: { type: String, required: true },
    subImages: {
      type: [String],
      validate: [(arr) => arr.length <= 4, 'Max 4 sub images'],
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    brand: { type: String, default: 'Generic', trim: true },
    tags: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [Number], default: [] },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('discountPercent').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round((1 - this.price / this.compareAtPrice) * 100);
});

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

productSchema.methods.recalculateRatings = function () {
  this.numReviews = this.reviews.length;
  this.rating = this.numReviews
    ? Math.round((this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.numReviews) * 10) / 10
    : 0;
};

productSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Product', productSchema);
