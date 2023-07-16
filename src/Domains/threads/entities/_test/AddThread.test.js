const AddThread = require('../AddThread');

describe('AddThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Thread Title',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 'title',
      body: 123,
      credentialId: 'user-123',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrowError(
      'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create AddThread entities object correctly', () => {
    // Arrange
    const payload = {
      title: 'title',
      body: 'body',
      credentialId: 'user-123',
    };

    // Action
    const addThread = new AddThread(payload);

    // Assert
    expect(addThread.title).toEqual(payload.title);
    expect(addThread.body).toEqual(payload.body);
    expect(addThread.credentialId).toEqual(payload.credentialId);
  });
});
