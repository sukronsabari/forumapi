const AuthenticationTokenManager = require('../AuthenticationTokenManager');

describe('AuthenticationTokenManager interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const authTokenManager = new AuthenticationTokenManager();

    // Action and Assert
    await expect(authTokenManager.createAccessToken('')).rejects.toThrowError(
      'AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    );
    await expect(authTokenManager.createRefreshToken('')).rejects.toThrowError(
      'AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    );
    await expect(authTokenManager.verifyRefreshToken('')).rejects.toThrowError(
      'AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    );
    await expect(authTokenManager.decodePayload('')).rejects.toThrowError(
      'AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED'
    );
  });
});
