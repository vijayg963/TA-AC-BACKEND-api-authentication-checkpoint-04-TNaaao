var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  answerId: { type: Schema.Types.ObjectId, ref: 'Answer' },
  questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
});

var Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
