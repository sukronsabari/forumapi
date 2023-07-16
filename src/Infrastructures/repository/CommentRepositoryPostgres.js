const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment({ content, threadId, credentialId }) {
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, createdAt, credentialId, threadId],
    };

    const result = await this._pool.query(query);

    return new AddedComment({
      ...result.rows[0],
    });
  }

  async getCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Comment tidak ditemukan. Id comment tidak terdapat di database'
      );
    }

    return result.rows[0];
  }

  async verifyCommentOwner(commentId, credentialId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    const { owner } = result.rows[0];

    if (owner !== credentialId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async softDeleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET content = $1, is_delete = $2 WHERE id = $3',
      values: ['**komentar telah dihapus**', true, id],
    };

    await this._pool.query(query);
  }

  async getCommentsInThread(threadId) {
    const query = {
      text: `SELECT c.id, c.created_at as date, c.content, u.username FROM comments c
      INNER JOIN users u ON c.owner = u.id WHERE c.thread_id = $1
      ORDER BY c.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      ...row,
      date: new Date(row.date).toISOString(),
    }));
  }
}

module.exports = CommentRepositoryPostgres;
