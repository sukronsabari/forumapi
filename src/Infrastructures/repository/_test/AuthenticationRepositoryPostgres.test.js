const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthenticatinRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const authRepositoryPostgres = new AuthenticatinRepositoryPostgres(pool);
      const token = 'token';

      // Action
      await authRepositoryPostgres.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('checkAvailabilityToken', () => {
    it('should throw InvariantError if token not available in database', async () => {
      // Arrange
      const authRepositoryPostgres = new AuthenticatinRepositoryPostgres(pool);
      const refreshToken = 'some_refresh_token';

      // Action
      await expect(
        authRepositoryPostgres.checkAvailabilityToken(refreshToken)
      ).rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError if token is available in database', async () => {
      // Arrange
      const authRepositoryPostgres = new AuthenticatinRepositoryPostgres(pool);
      const refreshToken = 'some_refresh_token';
      await AuthenticationsTableTestHelper.addToken(refreshToken);

      // Action and Assert
      await expect(
        authRepositoryPostgres.checkAvailabilityToken(refreshToken)
      ).resolves.not.toThrowError(InvariantError);
      await expect(
        AuthenticationsTableTestHelper.findToken(refreshToken)
      ).resolves.toHaveLength(1);
    });
  });

  describe('deleteToken function', () => {
    it('should delete token from database', async () => {
      // Arrange
      const authRepositoryPostgres = new AuthenticatinRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      await authRepositoryPostgres.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
