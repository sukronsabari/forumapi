const pool = require('../src/Infrastructures/database/postgres/pool');

/* istanbul ignore file */
const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'First comment',
    createdAt = '2023-06-14T12:36:15.417Z',
    owner = 'user-123',
    threadId = 'thread-123',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, content, createdAt, owner, threadId, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
