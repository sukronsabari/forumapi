class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, credentialId } = payload;
    this.title = title;
    this.body = body;
    this.credentialId = credentialId;
  }

  _verifyPayload(payload) {
    const { title, body, credentialId } = payload;

    if (!title || !body || !credentialId) {
      throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    const isString = (value) => typeof value === 'string';
    if (![title, body, credentialId].every(isString)) {
      throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThread;
