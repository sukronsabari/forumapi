const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../JwtTokenManager');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('JwtTokenManager', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };

      const mockJwtToken = {
        generate: jest
          .fn()
          .mockImplementation(() => Promise.resolve('mock_token')),
      };

      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(
        payload,
        process.env.ACCESS_TOKEN_KEY
      );
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };

      const mockJwtToken = {
        generate: jest
          .fn()
          .mockImplementation(() => Promise.resolve('mock_token')),
      };

      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(
        payload,
        process.env.REFRESH_TOKEN_KEY
      );
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({
        username: 'dicoding',
      });

      // Action and Assert
      await expect(
        jwtTokenManager.verifyRefreshToken(accessToken)
      ).rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when refreshToken verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({
        username: 'dicoding',
      });

      // Action and Assert
      await expect(
        jwtTokenManager.verifyRefreshToken(refreshToken)
      ).resolves.not.toThrowError(InvariantError);
    });
  });

  describe('decodePayload function', () => {
    it('should decode and return payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({
        username: 'dicoding',
      });

      // Action
      const { username } = await jwtTokenManager.decodePayload(refreshToken);

      // Assert
      expect(username).toEqual('dicoding');
    });
  });
});
