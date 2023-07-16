const AuthencticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const LogoutUserUseCase = require('../LogoutUserUseCase');

describe('LogoutUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if use case payload not contain refreshToken', async () => {
    // Arrange
    const useCasePayload = {};
    const logoutUseCase = new LogoutUserUseCase({});

    // Action and Assert
    await expect(logoutUseCase.execute(useCasePayload)).rejects.toThrowError(
      'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN'
    );
  });

  it('should throw error if refreshToken (payload) is not string', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 12345555,
    };
    const logoutUseCase = new LogoutUserUseCase({});

    // Action and Assert
    await expect(logoutUseCase.execute(useCasePayload)).rejects.toThrowError(
      'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should orchestrating the delete authentication action correctly', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'refreshToken',
    };

    const mockAuthenticationRepository = new AuthencticationRepository();
    mockAuthenticationRepository.checkAvailabilityToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationRepository.deleteToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    // create instance use case
    const logoutUseCase = new LogoutUserUseCase({
      authenticationRepository: mockAuthenticationRepository,
    });

    // Action
    await logoutUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationRepository.checkAvailabilityToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
    expect(mockAuthenticationRepository.deleteToken).toBeCalledWith(
      useCasePayload.refreshToken
    );
  });
});
