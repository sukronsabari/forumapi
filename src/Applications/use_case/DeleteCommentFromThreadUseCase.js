class DeleteCommentFromThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ threadId, commentId, credentialId }) {
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.getCommentById(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, credentialId);
    await this._commentRepository.softDeleteCommentById(commentId);
  }
}

module.exports = DeleteCommentFromThreadUseCase;
