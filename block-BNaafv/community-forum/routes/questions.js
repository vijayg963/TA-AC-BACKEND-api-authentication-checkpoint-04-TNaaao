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

//get all the questions
router.get('/', async (req, res, next) => {
  try {
    let questions = await Question.find({}).populate('author');
    res.status(202).json({ questions: formatQuestions(questions) });
  } catch (error) {
    next(error);
  }
});

//get all the answers of a question
router.get('/:questionId/answers', async (req, res, next) => {
  try {
    let questionId = req.params.questionId;
    let answers = await Answer.find({ questionId: questionId }).populate(
      'author'
    );
    res.status(202).json({ answers: formatAnswers(answers) });
  } catch (error) {
    next(error);
  }
});

// a blocked user can not have  longer access to these routes
router.use(auth.isAuthorized);

//create a question
router.post('/', auth.isVerified, async (req, res, next) => {
  try {
    //convert the tags string into an array
    req.body.slug = '';
    req.body.tags = req.body.tags.split(',');
    req.body.author = req.user.id;
    let question = await Question.create(req.body);
    // let updateUser = await User.findByIdAndUpdate(
    //   req.user.id,
    //   {
    //     $push: { questions: question._id },
    //   },
    //   { new: true }
    // );
    question = await Question.findById(question._id).populate('author');
    res.status(201).json({ question: formatQuestion(question) });
  } catch (error) {
    next(error);
  }
});

//update question
router.put('/:slug', auth.isVerified, async (req, res, next) => {
  //   if the user update tags then once again convert str to array
  if (req.body.tags) {
    req.body.tags = req.body.tags.split(',');
  }
  //   if user change its  title then also change  its slug
  if (req.body.title) {
    req.body.slug = req.body.title.split(' ').join('_');
  }
  try {
    let question = await Question.findOne({ slug: req.params.slug });
    // if user who is updating article is the author of that article then
    // only he can update the article
    if (question.author == req.user.id) {
      //udpate question
      const updatedQuestion = await Question.findByIdAndUpdate(
        question._id,
        req.body,
        { new: true }
      ).populate('author');
      res.status(201).json({ question: formatQuestion(updatedQuestion) });
    }
    // if user is not author of this article then
    res.status(401).json({ error: 'sorry you are not authorized to update' });
  } catch (error) {
    next(error);
  }
});

//delete an question only its creator can delete the question
//other users are not authorized to delete this question
router.delete('/:slug', auth.isVerified, async (req, res, next) => {
  try {
    let question = await Question.findOne({ slug: req.params.slug });
    // only user who create this question can delete this question
    if (question.author == req.user.id) {
      //udpate question
      const deletedQuestion = await Question.findByIdAndDelete(question._id);
      const deleteQuestionComment = await Comment.deleteMany({
        questionId: deletedQuestion._id,
      });
      res.status(201).json({ message: 'article deleted sucessfully' });
    }
    // if user is not author of this article then
    res.status(400).json({ error: 'sorry you are not authorized to delete' });
  } catch (error) {
    next(error);
  }
});

//add an answer
router.post('/:questionid/answer', auth.isVerified, async (req, res, next) => {
  try {
    let questionId = req.params.questionid;
    req.body.questionId = questionId;
    req.body.author = req.user.id;
    let answer = await Answer.create(req.body);
    //now also update question document and add the answer id
    let updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      {
        $push: { answers: answer },
      },
      { new: true }
    );
    answer = await Answer.findById(answer._id).populate('author');
    //return the created answer
    res.status(201).json({ answer: formatAnswer(answer) });
  } catch (error) {
    next(error);
  }
});

// add comment on the question
router.post('/:questionId/comment', auth.isVerified, async (req, res, next) => {
  try {
    req.body.author = req.user.id;
    req.body.questionId = req.params.questionId;
    let comment = await Comment.create(req.body);
    let updatedAnswer = await Question.findByIdAndUpdate(
      req.params.questionId,
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

//upvote question .One user can upvote for only single time
router.get('/:questionId/upvote', auth.isVerified, async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.questionId);
    // a user can upvote only once not multiple times
    if (!question.upvotedBy.includes(req.user.id)) {
      let upvoteQuestion = await Question.findByIdAndUpdate(
        req.params.questionId,
        { $inc: { upvoteCount: 1 }, $push: { upvotedBy: req.user.id } },
        { new: true }
      ).populate('author');
      return res
        .status(202)
        .json({ upvotedQuestion: formatQuestion(upvoteQuestion) });
    }
    res.status(400).json({ message: 'you can not upvote multiple times' });
  } catch (error) {
    next(error);
  }
});

// remove your upvote form the question and delete its reference
router.get(
  '/:questionId/removevote',
  auth.isVerified,
  async (req, res, next) => {
    try {
      let question = await Question.findById(req.params.questionId);
      if (question.upvotedBy.includes(req.user.id)) {
        let removeUpvote = await Question.findByIdAndUpdate(
          req.params.questionId,
          { $inc: { upvoteCount: -1 }, $pull: { upvotedBy: req.user.id } },
          { new: true }
        ).populate('author');
        return res
          .status(202)
          .json({ upvotedQuestion: formatQuestion(removeUpvote) });
      }
      res.status(400).json({ message: 'you have not voted yet' });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
