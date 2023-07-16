const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addThread function', () => {
    it('should add thread to database correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const addThreadEntity = new AddThread({
        title: 'title',
        body: 'body',
        credentialId: 'user-123',
      });

      const fakeIdGenerator = () => 'abc';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.addThread(addThreadEntity);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-abc');
      expect(threads).toHaveLength(1);
      expect(threads[0].id).toEqual('thread-abc');
      expect(typeof parseInt(threads[0].created_at, 10)).toEqual('number');
    });

    it('should return addedThread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-456' });
      const addThreadEntity = new AddThread({
        title: 'title 1',
        body: 'body 1',
        credentialId: 'user-456',
      });

      const fakeIdGenerator = () => '456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        addThreadEntity
      );

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-456',
          title: 'title 1',
          owner: 'user-456',
        })
      );
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        threadRepository.getThreadById('thread-123')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const threadRepository = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepository.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.owner).toEqual('user-123');
    });
  });

  describe('getDetailThreadById function', () => {
    it('should throw NotFoundError when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        threadRepositoryPostgres.getDetailThreadById('thread-123')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread correctly', async () => {
      // Arrange
      const credentialId = 'user-123';
      const threadId = 'thread-123';

      const username = 'dicoding';
      const dateString = '2023-06-14T12:36:15.417Z';

      await UsersTableTestHelper.addUser({
        id: credentialId,
        username,
      });
      await ThreadsTableTestHelper.addThread({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        createdAt: dateString,
        owner: credentialId,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const detailThread = await threadRepositoryPostgres.getDetailThreadById(
        threadId
      );

      // Assert
      expect(detailThread).toEqual({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: dateString,
        username,
      });
    });
  });
});
