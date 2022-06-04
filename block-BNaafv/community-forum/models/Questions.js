var mongoose = require('mongoose');
const Answer = require('./answers');
var Schema = mongoose.Schema;

var questionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    slug: { type: String },
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    upvoteCount: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

// assign slug to article document
questionSchema.pre('save', function (next) {
  this.slug = this.title + randomNumber();
  this.slug = this.slug.split('').join('-');
  next();
});

function randomNumber(num = 12322) {
  return Math.floor(Math.random() * num);
}

module.exports = mongoose.model('question', questionSchema);
