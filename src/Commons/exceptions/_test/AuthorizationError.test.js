const AuthorizationError = require('../AuthorizationError');
const ClientError = require('../ClientError');

describe('AuthorizationError', () => {
  it('should create error correctly', async () => {
    // Arrange
    const authorizationError = new AuthorizationError('authorization error!');

    // Action
    expect(authorizationError).toBeInstanceOf(ClientError);
    expect(authorizationError.statusCode).toEqual(403);
    expect(authorizationError.message).toEqual('authorization error!');
    expect(authorizationError.name).toEqual('AuthorizationError');
  });
});
