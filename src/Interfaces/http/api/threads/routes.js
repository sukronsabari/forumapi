const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: (req, h) => handler.postThreadHandler(req, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: (req, h) => handler.getDetailThreadByIdHandler(req, h),
  },
];

module.exports = routes;
