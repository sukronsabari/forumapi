const DeleteCommentFromThreadUseCase = require('../DeleteCommentFromThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('DeleteCommentFromThreadUseCase', () => {
  it('should orchestrating delete comment from thread action correctly', async () => {
    // Arrange
    const mockThreadId = 'thread-123';
    const mockCommentId = 'comment-123';
    const mockCredetialId = 'user-123';
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.softDeleteCommentById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const deleteCommentFromThreadUseCase = new DeleteCommentFromThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentFromThreadUseCase.execute({
      threadId: mockThreadId,
      commentId: mockCommentId,
      credentialId: mockCredetialId,
    });

    // Action
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.getCommentById).toBeCalledWith(mockCommentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(
      mockCommentId,
      mockCredetialId
    );
    expect(mockCommentRepository.softDeleteCommentById).toBeCalledWith(
      mockCommentId
    );
  });
});
