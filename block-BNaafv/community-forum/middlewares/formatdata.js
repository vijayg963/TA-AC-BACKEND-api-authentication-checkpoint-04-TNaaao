function userJSON(user, token) {
  return {
    token: token,
    username: user.username,
    email: user.email,
  };
}

// to format user profile
function userProfile(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
  };
}

// return a single question
function formatQuestion(question) {
  return {
    tags: question.tags,
    id: question._id,
    title: question.title,
    description: question.description,
    author: userProfile(question.author),
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
    slug: question.slug,
    upvoteCount: question.upvoteCount,
  };
}
function formatQuestionandAnswer(question) {
  // if no answers is there then null will be the default  value
  if (!question.answer) {
    question.answer = null;
  }
  return {
    tags: question.tags,
    id: question._id,
    title: question.title,
    answer: formatAnswer(question.answer),
    description: question.description,
    author: userProfile(question.author),
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
    slug: question.slug,
  };
}
// return a single answer

function formatAnswer(answer) {
  return {
    id: answer._id,
    text: answer.text,
    author: userProfile(answer.author),
    createdAt: answer.createdAt,
    updatedAt: answer.updatedAt,
    upvoteCount: answer.upvoteCount,
    slug: answer.slug,
  };
}

// function to format multiple  questions
function formatQuestions(questions) {
  return questions.map((question) => formatQuestion(question));
}

// function to format multipleAnswers
function formatAnswers(answers) {
  return answers.map((answer) => formatAnswer(answer));
}

//function to format comment
function formatComment(comment) {
  return {
    id: comment._id,
    createdAt: comment.createAt,
    updatedAt: comment.updatedAt,
    content: comment.content,
    author: userProfile(comment.author),
  };
}
module.exports = {
  userJSON,
  userProfile,
  formatAnswer,
  formatQuestion,
  formatQuestions,
  formatAnswers,
  formatComment,
};
