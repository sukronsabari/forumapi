const AuthenticationRepository = require('../AuthenticationRepository');

describe('AuthencticationRepository interface', () => {
  it('should throw error when invoke abstract behaviour', async () => {
    // Arrange
    const authRepository = new AuthenticationRepository();

    // Action and Assert
    await expect(authRepository.addToken('')).rejects.toThrowError(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
    await expect(
      authRepository.checkAvailabilityToken('')
    ).rejects.toThrowError('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(authRepository.deleteToken('')).rejects.toThrowError(
      'AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED'
    );
  });
});
