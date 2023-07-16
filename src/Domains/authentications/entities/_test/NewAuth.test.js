const NewAuth = require('../NewAuth');

describe('NewAuth entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      refreshToken: 'refreshToken',
    };

    // Actin and Assert
    expect(() => new NewAuth(payload)).toThrowError(
      'NEW_AUTH.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      accessToken: 'accessToken',
      refreshToken: true,
    };

    // Action and Assert
    expect(() => new NewAuth(payload)).toThrowError(
      'NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create NewAuth entities correctly', () => {
    // Arrange
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    // Action
    const newAuth = new NewAuth(payload);

    // Assert
    const { accessToken, refreshToken } = newAuth;
    expect(newAuth).toBeInstanceOf(NewAuth);
    expect(accessToken).toEqual(payload.accessToken);
    expect(refreshToken).toEqual(payload.refreshToken);
  });
});
