const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: (req, h) => handler.postCommentToThreadHandler(req, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: (req, h) => handler.deleteCommentWithIdFromThreadHandler(req, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
];

module.exports = routes;
