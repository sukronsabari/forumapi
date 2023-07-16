const UserLogin = require('../UserLogin');

describe('UserLogin entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
    };

    // Action and Assert
    expect(() => new UserLogin(payload)).toThrowError(
      'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
      password: true,
    };

    // Action and Assert
    expect(() => new UserLogin(payload)).toThrowError(
      'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create userLogin entities correctly', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
      password: 'secret',
    };

    // Action
    const userLogin = new UserLogin(payload);

    // Assert
    const { username, password } = userLogin;
    expect(userLogin).toBeInstanceOf(UserLogin);
    expect(username).toEqual(payload.username);
    expect(password).toEqual(payload.password);
  });
});
