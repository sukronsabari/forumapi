const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddThread = require('../../../Domains/threads/entities/AddThread');

describe('AddThreadUseCase', () => {
  it('should orchestrating addThread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'Title',
      body: 'Body',
    };

    // params in execute(useCasePayload, credentialId) function
    const mockCredentialId = 'user-123';

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: mockCredentialId,
    });

    const mockThreadRepository = new ThreadRepository({});

    /** mocking */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** create usecase instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(
      useCasePayload,
      mockCredentialId
    );

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: mockCredentialId,
      })
    );
    expect(mockThreadRepository.addThread).toBeCalledWith(
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        credentialId: mockCredentialId,
      })
    );
  });
});
