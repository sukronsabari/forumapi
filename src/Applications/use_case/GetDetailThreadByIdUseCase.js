class GetDetailThreadByIdUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getDetailThreadById(threadId);
    const comments = await this._commentRepository.getCommentsInThread(
      threadId
    );

    return {
      ...thread,
      comments,
    };
  }
}

module.exports = GetDetailThreadByIdUseCase;
