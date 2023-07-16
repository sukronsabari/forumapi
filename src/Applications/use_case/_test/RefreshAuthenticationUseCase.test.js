const RefreshAuthenticationUseCase = require('../RefreshAuthenticationUseCase');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('RefreshAuthenticationUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if use case payload not contain refreshToken', async () => {
    // Arrange
    const useCasePayload = {};
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action and Assert
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN'
    );
  });

  it('should throw error if refreshToken payload is not string', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: ['refreshToken'],
    };
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({});

    // Action
    await expect(
      refreshAuthenticationUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should orchestrating the refresh authentication action correctly', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'some_refresh_token',
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockAuthenticationTokenManager.verifyRefreshToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ username: 'dicoding', id: 'user-123' })
      );
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve('some_access_token'));

    // create instance use case
    const refreshAuthenticationUseCase = new RefreshAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const newAccessToken = await refreshAuthenticationUseCase.execute(
      useCasePayload
    );

    // Assert
    expect(newAccessToken).toEqual('some_access_token');
    expect(mockAuthenticationTokenManager.verifyRefreshToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthenticationTokenManager.createAccessToken).toBeCalledWith({
      username: 'dicoding',
      id: 'user-123',
    });
  });
});
