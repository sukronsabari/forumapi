const NewAuth = require('../../../Domains/authentications/entities/NewAuth');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const LoginUserUseCase = require('../LoginUserUseCase');

describe('GetAuthenticationUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should orchestrating the get authentication action correctly', async () => {
    // Arrange
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret',
    };

    const mockedAuthentication = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });

    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'));
    mockPasswordHash.comparePassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(mockedAuthentication.accessToken)
      );
    mockAuthenticationTokenManager.createRefreshToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(mockedAuthentication.refreshToken)
      );
    mockAuthenticationRepository.addToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case instance */
    const getAuthenticationUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await getAuthenticationUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(actualAuthentication).toStrictEqual(
      new NewAuth({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      })
    );
    expect(mockUserRepository.getIdByUsername).toBeCalledWith(
      useCasePayload.username
    );
    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith(
      useCasePayload.username
    );
    expect(mockPasswordHash.comparePassword).toBeCalledWith(
      useCasePayload.password,
      'encrypted_password'
    );
    expect(mockAuthenticationTokenManager.createAccessToken).toBeCalledWith({
      id: 'user-123',
      username: useCasePayload.username,
    });
    expect(mockAuthenticationTokenManager.createRefreshToken).toBeCalledWith({
      id: 'user-123',
      username: useCasePayload.username,
    });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith(
      mockedAuthentication.refreshToken
    );
  });
});
