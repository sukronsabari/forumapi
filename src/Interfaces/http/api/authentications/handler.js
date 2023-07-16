const LoginUserUseCase = require('../../../../Applications/use_case/LoginUserUseCase');
const RefreshAuthenticationUseCase = require('../../../../Applications/use_case/RefreshAuthenticationUseCase');
const LogoutUserUseCase = require('../../../../Applications/use_case/LogoutUserUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    const loginUserUseCase = this._container.getInstance(LoginUserUseCase.name);
    const { accessToken, refreshToken } = await loginUserUseCase.execute(
      request.payload
    );

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(req) {
    const refreshAuthenticationUseCase = this._container.getInstance(
      RefreshAuthenticationUseCase.name
    );
    const newAccessToken = await refreshAuthenticationUseCase.execute(
      req.payload
    );

    return {
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    };
  }

  async deleteAuthenticationHandler(req) {
    const logoutUserUseCase = this._container.getInstance(
      LogoutUserUseCase.name
    );
    await logoutUserUseCase.execute(req.payload);

    return {
      status: 'success',
      message: 'Authentikasi berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
