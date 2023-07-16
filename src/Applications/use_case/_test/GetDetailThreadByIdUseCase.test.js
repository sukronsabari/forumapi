const GetDetailThreaddByIdUseCase = require('../GetDetailThreadByIdUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('GetThreadByIdUseCase', () => {
  it('should orchestrating get thread by id action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2023-06-14T12:36:15.417Z',
      username: 'dicoding',
    };

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2023-06-14T12:36:15.417Z',
        content: 'sebuah comment',
      },
      {
        id: 'comment-234',
        username: 'dicoding',
        date: '2023-06-14T12:36:15.417Z',
        content: '**komentar telah dihapus**',
      },
    ];

    /** mocking */
    mockThreadRepository.getDetailThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsInThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** create use case instance */
    const getDetailThreadByIdUseCase = new GetDetailThreaddByIdUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadByIdUseCase.execute(threadId);

    expect(detailThread).toStrictEqual({
      ...mockThread,
      comments: mockComments,
    });
    expect(mockThreadRepository.getDetailThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsInThread).toBeCalledWith(threadId);
  });
});
