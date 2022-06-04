const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Question = require('../models/questions');
const User = require('../models/users');
const Answer = require('../models/answers');
const Comment = require('../models/comments');
let dataformat = require('../middlewares/formatdata');

let {
  userJSON,
  userProfile,
  formatQuestion,
  formatQuestions,
  formatAnswer,
  formatAnswers,
  formatComment,
} = dataformat;

// a blocked user can not longer access to these routes
router.use(auth.isAuthorized);

// update Answer
router.put('/:answerId', auth.isVerified, async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.answerId);
    //  same person can edit is own answer
    if (answer.author == req.user.id) {
      let updatedAnswer = await Answer.findByIdAndUpdate(answer._id, req.body, {
        new: true,
      }).populate('author');
      // return updated answer
      return res.status(200).json({ answer: formatAnswer(updatedAnswer) });
    }
    // this will return only when if the user who is trying to edit
    // is not the same user who have created this answer
    res.status(400).json({
      error: 'sorry you are not authorized to edit other user answers',
    });
  } catch (error) {
    next(error);
  }
});

// delete the answer
router.delete('/:answerId', auth.isVerified, async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.answerId);
    // if same user is then answer can be deleted
    if (answer.author == req.user.id) {
      let removedAnswer = await Answer.findByIdAndDelete(answer._id);
      let removeRefrence = await Question.findByIdAndUpdate(
        removedAnswer.questionId,
        { $pull: { answer: answer._id } },
        { new: true }
      );
      let deleteComment = await Comment.deleteMany({ answerId: answer._id });
      // return updated answer
      return res.status(200).json({ message: 'article deleted Sucessfully' });
    }
    // if id did not match
    res.status(400).json({
      error: 'sorry you are not authorized to delete other user answers',
    });
  } catch (error) {
    next(error);
  }
});

// upvote answer once per user only
router.get('/:answerId/upvote', auth.isVerified, async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.answerId);
    // maximum once upvote by single user
    if (!answer.upvotedBy.includes(req.user.id)) {
      let upvotedAnswer = await Answer.findByIdAndUpdate(
        req.params.answerId,
        { $inc: { upvoteCount: 1 }, $push: { upvotedBy: req.user.id } },
        { new: true }
      ).populate('author');
      return res.status(202).json({ answer: formatAnswer(upvotedAnswer) });
    }
    return res
      .status(400)
      .json({ message: 'you can not upvote multiple times' });
  } catch (error) {
    next(error);
  }
});

//remove your  vote from answer but only those user can remove their vote whose
// have voted  for a answer
router.get('/:answerId/removevote', auth.isVerified, async (req, res, next) => {
  try {
    let answer = await Answer.findById(req.params.answerId);
    if (answer.upvotedBy.includes(req.user.id)) {
      let removeUpvote = await Answer.findByIdAndUpdate(
        req.params.answerId,
        { $inc: { upvoteCount: -1 }, $pull: { upvotedBy: req.user.id } },
        { new: true }
      ).populate('author');
      return res.status(202).json({ answer: formatAnswer(removeUpvote) });
    }
    res.status(400).json({ message: 'you  have not added a vote yet ' });
  } catch (error) {
    next(error);
  }
});

/// add comments on  answer
router.post('/:answerId/comment', auth.isVerified, async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    req.body.answerId = req.params.answerId;
    let comment = await Comment.create(req.body);
    let updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.answerId,
      {
        $push: { comments: comment._id },
      },
      { new: true }
    );
    comment = await Comment.findById(comment._id).populate('author');
    res.status(201).json({ comment: formatComment(comment) });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
