const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadByIdUseCase = require('../../../../Applications/use_case/GetDetailThreadByIdUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadHandler(req, h) {
    const { id: credentialId } = req.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id, title, owner } = await addThreadUseCase.execute(
      req.payload,
      credentialId
    );

    const response = h.response({
      status: 'success',
      data: {
        addedThread: {
          id,
          title,
          owner,
        },
      },
    });

    response.code(201);
    return response;
  }

  async getDetailThreadByIdHandler(req) {
    const getDetailThreadByIdUseCase = this._container.getInstance(
      GetDetailThreadByIdUseCase.name
    );
    const { threadId } = req.params;
    const detailThread = await getDetailThreadByIdUseCase.execute(threadId);

    return {
      status: 'success',
      data: {
        thread: { ...detailThread },
      },
    };
  }
}

module.exports = ThreadsHandler;
