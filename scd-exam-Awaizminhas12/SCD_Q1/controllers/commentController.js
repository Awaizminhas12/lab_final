const Comment = require('../models/Comment');

// Add Comment
exports.addComment = async (req, res) => {
  const { blogId, content } = req.body;

  const comment = new Comment({
    blogId,
    content,
    author: req.userId
  });

  await comment.save();
  res.status(201).json({ message: 'Comment added successfully' });
};

// Get Comments for a Blog
exports.getComments = async (req, res) => {
  const comments = await Comment.find({ blogId: req.params.blogId }).populate('author', 'username');
  res.json(comments);
};
