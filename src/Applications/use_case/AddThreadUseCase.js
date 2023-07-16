const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, credentialId) {
    const addThreadEntities = new AddThread({
      ...useCasePayload,
      credentialId,
    });
    return this._threadRepository.addThread(addThreadEntities);
  }
}

module.exports = AddThreadUseCase;
