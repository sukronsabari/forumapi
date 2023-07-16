const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThreadEntity) {
    const { title, body, credentialId: owner } = addThreadEntity;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, owner',
      values: [id, title, body, createdAt, updatedAt, owner],
    };

    const result = await this._pool.query(query);

    return new AddedThread({
      ...result.rows[0],
    });
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Thread tidak ditemukan. Id thread tidak terdapat di database'
      );
    }

    return result.rows[0];
  }

  async getDetailThreadById(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at as date, u.username FROM threads t
      INNER JOIN users u ON t.owner = u.id WHERE t.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }

    return result.rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString(),
    }))[0];
  }
}

module.exports = ThreadRepositoryPostgres;
