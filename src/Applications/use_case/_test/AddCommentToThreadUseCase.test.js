/* eslint-disable no-unused-vars */
const AddCommentToThreadUseCase = require('../AddCommentToThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentToThreadUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if use case payload not contain content property', async () => {
    // Arrange
    const useCasePayload = {};
    const addCommentToThreadUseCase = new AddCommentToThreadUseCase({});

    // Action and Assert
    await expect(
      addCommentToThreadUseCase.execute({
        useCasePayload,
        threadId: {},
        credentialId: {},
      })
    ).rejects.toThrowError(
      'ADD_COMMENT_TO_THREAD_USE_CASE.NOT_CONTAIN_CONTENT'
    );
  });

  it('should throw error if content not string', async () => {
    // Arrange
    const useCasePayload = {
      content: true,
    };
    const addCommentToThreadUseCase = new AddCommentToThreadUseCase({});

    // Action and Assert
    await expect(
      addCommentToThreadUseCase.execute({
        useCasePayload,
        threadId: {},
        credentialId: {},
      })
    ).rejects.toThrowError(
      'ADD_COMMENT_TO_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should orchestrating add comment to thread action', async () => {
    // Arrange
    const useCasePayload = {
      content: 'First comment in thread',
    };
    const mockThreadId = 'thread-123';
    const mockCredentialId = 'user-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: 'first comment',
      owner: mockCredentialId,
    });

    const mockThreadRepository = new ThreadRepository({});
    const mockCommentRepository = new CommentRepository({});

    /** mocking */
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** create use case instance */
    const addCommentToThreadUseCase = new AddCommentToThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentToThreadUseCase.execute({
      useCasePayload,
      threadId: mockThreadId,
      credentialId: mockCredentialId,
    });

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: 'first comment',
        owner: mockCredentialId,
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(mockThreadId);
    expect(mockCommentRepository.addComment).toBeCalledWith({
      ...useCasePayload,
      threadId: mockThreadId,
      credentialId: mockCredentialId,
    });
  });
});
