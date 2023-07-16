const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addComment function', () => {
    it('should add comment to database correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      const useCasePayload = {
        content: 'First comment',
      };
      const params = {
        ...useCasePayload,
        threadId: 'thread-123',
        credentialId: 'user-123',
      };
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(params);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
    });

    it('should be able to add comments using a user other than the thread owner', async () => {
      // Arrange
      const userA = 'user-123';
      const userB = 'user-124';

      await UsersTableTestHelper.addUser({ id: userA, username: 'johndoe' });
      await UsersTableTestHelper.addUser({ id: userB, username: 'dicoding' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      const useCasePayload = {
        content: 'First comment',
      };
      const params = {
        ...useCasePayload,
        threadId: 'thread-123',
        credentialId: userB,
      };
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(params);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        'comment-123'
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].owner).toEqual(userB);
    });

    it('should return AddedComment object correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });

      const useCasePayload = {
        content: 'First comment',
      };
      const params = {
        ...useCasePayload,
        threadId: 'thread-123',
        credentialId: 'user-123',
      };
      const fakeIdGenerator = () => '123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(params);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: useCasePayload.content,
          owner: 'user-123',
        })
      );
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and assert
      await expect(
        commentRepositoryPostgres.getCommentById('comment-123')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Javascript',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comment = await commentRepositoryPostgres.getCommentById(
        'comment-123'
      );

      expect(comment.id).toEqual('comment-123');
      expect(comment.content).toEqual('Javascript');
      expect(comment.owner).toEqual('user-123');
      expect(comment.thread_id).toEqual('thread-123');
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when user is not the owner of the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Javascript',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const credentialId = 'user-xxxx';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, credentialId)
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when user is the owner of the comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Javascript',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const credentialId = 'user-123';
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, credentialId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('softDeleteCommentById function', () => {
    it('should soft delete the comment correctly, by changing the is_delete column with a true value, and changing the content to **komentar telah dihapus**.', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        content: 'Javascript',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.softDeleteCommentById(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('**komentar telah dihapus**');
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsInThread function', () => {
    it('should return comments in thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const userA = 'user-123';
      const userB = 'user-124';

      await UsersTableTestHelper.addUser({
        id: userA,
        username: 'johndoe',
      });
      await UsersTableTestHelper.addUser({
        id: userB,
        username: 'dicoding',
      });

      await ThreadsTableTestHelper.addThread({
        id: threadId,
        owner: userA,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId,
        owner: userA,
        createdAt: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-124',
        threadId,
        owner: userB,
        createdAt: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsInThread(
        threadId
      );

      // Assert
      expect(comments).toEqual([
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ]);
    });
  });
});
