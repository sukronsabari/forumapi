class AddCommentToThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({ useCasePayload, threadId, credentialId }) {
    this._verifyPayload(useCasePayload);
    await this._threadRepository.getThreadById(threadId);
    return this._commentRepository.addComment({
      ...useCasePayload,
      threadId,
      credentialId,
    });
  }

  _verifyPayload(payload) {
    const { content } = payload;

    if (!content) {
      throw new Error('ADD_COMMENT_TO_THREAD_USE_CASE.NOT_CONTAIN_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error(
        'ADD_COMMENT_TO_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
      );
    }
  }
}

module.exports = AddCommentToThreadUseCase;
