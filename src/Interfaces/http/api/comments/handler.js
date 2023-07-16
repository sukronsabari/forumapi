const AddCommentToThreadUseCase = require('../../../../Applications/use_case/AddCommentToThreadUseCase');
const DeleteCommentFromThreadUseCase = require('../../../../Applications/use_case/DeleteCommentFromThreadUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentToThreadHandler(req, h) {
    const addCommentToThreadUseCase = this._container.getInstance(
      AddCommentToThreadUseCase.name
    );
    const { threadId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    const { id, content, owner } = await addCommentToThreadUseCase.execute({
      useCasePayload: req.payload,
      threadId,
      credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedComment: {
          id,
          content,
          owner,
        },
      },
    });

    response.code(201);
    return response;
  }

  async deleteCommentWithIdFromThreadHandler(req) {
    const deleteCommentFromThreadUseCase = this._container.getInstance(
      DeleteCommentFromThreadUseCase.name
    );
    const { threadId, commentId } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await deleteCommentFromThreadUseCase.execute({
      threadId,
      commentId,
      credentialId,
    });

    return {
      status: 'success',
      message: 'Comment berhasil dihapus',
    };
  }
}

module.exports = CommentsHandler;
