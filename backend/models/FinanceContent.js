import mongoose from 'mongoose';

const financeContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Investment', 'Trading', 'Personal Finance', 'Market News', 'Crypto', 'Tax Planning', 'Other'],
    default: 'Other',
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    enum: ['article', 'video', 'pdf', 'tool'],
    default: 'article',
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  isVisible: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  videoLink: {
    type: String,
    trim: true
  },
  toolLink: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date
  }
}, { timestamps: true });

// Auto-generate slug from title before saving
financeContentSchema.pre('save', async function(next) {
  // Always regenerate slug when title is modified
  if (this.isModified('title')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await mongoose.models.FinanceContent.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Set publishedAt when first published
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Compound indexes for performance
financeContentSchema.index({ isPublished: 1, publishedAt: -1 });
financeContentSchema.index({ category: 1, isPublished: 1, publishedAt: -1 });
financeContentSchema.index({ isFeatured: 1, isPublished: 1, publishedAt: -1 });
financeContentSchema.index({ isVisible: 1, isPublished: 1, publishedAt: -1 });
financeContentSchema.index({ type: 1, isPublished: 1, publishedAt: -1 });

export default mongoose.model('FinanceContent', financeContentSchema);
