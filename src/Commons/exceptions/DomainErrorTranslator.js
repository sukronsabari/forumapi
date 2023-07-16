const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return this._directories[error.message] || error;
  },

  _directories: {
    'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
      'tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'
    ),
    'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
      'tidak dapat membuat user baru karena tipe data tidak sesuai'
    ),
    'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError(
      'tidak dapat membuat user baru karena karakter username melebihi batas limit'
    ),
    'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError(
      'tidak dapat membuat user baru karena username mengandung karakter terlarang'
    ),
    'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
      'harus mengirimkan username dan password'
    ),
    'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
      'username dan password harus string'
    ),
    'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
      'Title dan body dari thread harus dicantumkan'
    ),
    'ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(
      'Title dan body harus berupa string'
    ),

    'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
      new InvariantError('harus mengirimkan refreshToken'),

    'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
      new InvariantError('refreshToken harus string'),

    'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN':
      new InvariantError('harus mengirimkan refreshToken'),

    'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
      new InvariantError('refreshToken harus string'),

    'ADD_COMMENT_TO_THREAD_USE_CASE.NOT_CONTAIN_CONTENT': new InvariantError(
      'content tidak boleh kosong'
    ),

    'ADD_COMMENT_TO_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION':
      new InvariantError('content harus bertipe data string'),
  },
};

module.exports = DomainErrorTranslator;
