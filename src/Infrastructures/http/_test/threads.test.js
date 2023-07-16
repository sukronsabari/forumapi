const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    let accessToken;

    beforeEach(async () => {
      const server = await createServer(container);

      // register user to db
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login and get accessToken
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const payload = JSON.parse(loginResponse.payload);
      accessToken = payload.data.accessToken;
    });

    it('should response 201 and return addedThread', async () => {
      // Arrange
      const server = await createServer(container);

      const requestPayload = {
        title: 'First Thread',
        body: 'My first thread',
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const { addedThread } = responseJson.data;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(addedThread).toBeDefined();
      expect(addedThread.id).toBeDefined();
      expect(addedThread.title).toEqual(requestPayload.title);
      expect(addedThread.owner).toBeDefined();
    });

    it('should response 400 if request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);

      const requestPayload = {
        title: 'Catatan Pertama',
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Title dan body dari thread harus dicantumkan'
      );
    });

    it('should response 400 if request payload did not meet data type specification', async () => {
      // Arrange
      const server = await createServer(container);

      const requestPayload = {
        title: 'Catatan Pertama',
        body: true,
      };

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Title dan body harus berupa string'
      );
    });

    it('should response 401 if headers request cannot contain Authorization Bearer <token>', async () => {
      // Arrange
      const server = await createServer(container);
      const requestPayload = {
        title: 'First thread',
        body: 'This is my first thread',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 if token in headers request (Authorization: Bearer <token>) is invalid', async () => {
      // Arrange
      const requestPayload = {
        title: 'Second thread',
        body: 'This is my second thread',
      };
      const invalidToken = 'invalid_token';
      const headers = {
        Authorization: `Bearer ${invalidToken}`,
      };
      const server = await createServer(container);

      // Assert
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return detail thread correctly', async () => {
      // Arrange
      const server = await createServer(container);

      // register userA (dicoding)
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // register userB (johndoe)
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'johndoe',
          password: 'secret',
          fullname: 'John Doe',
        },
      });

      // login
      const loginResponseUserA = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const loginResponseUserAJson = JSON.parse(loginResponseUserA.payload);
      const { accessToken: accessTokenA } = loginResponseUserAJson.data;

      const loginResponseUserB = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'johndoe',
          password: 'secret',
        },
      });

      const loginResponseUserBJson = JSON.parse(loginResponseUserB.payload);
      const { accessToken: accessTokenB } = loginResponseUserBJson.data;

      // add thread using userA (dicoding)
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'sebuah thread',
          body: 'sebuah body thread',
        },
        headers: {
          Authorization: `Bearer ${accessTokenA}`,
        },
      });

      const addThreadResponseJson = JSON.parse(addThreadResponse.payload);
      const { id: threadId } = addThreadResponseJson.data.addedThread;

      // add comment with userB (johndoe)
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenB}`,
        },
      });

      // add comment with userA (dicoding)
      const commentUserAResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'sebuah comment',
        },
        headers: {
          Authorization: `Bearer ${accessTokenA}`,
        },
      });

      const commentUserAResponseJson = JSON.parse(commentUserAResponse.payload);
      const { id: userACommentId } = commentUserAResponseJson.data.addedComment;

      // delete comment userA (dicoding)
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${userACommentId}`,
        headers: {
          Authorization: `Bearer ${accessTokenA}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      const { thread } = responseJson.data;
      const { comments } = thread;
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(thread.id).toBeDefined();
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.date).toBeDefined();
      expect(thread.username).toEqual('dicoding');
      expect(comments).toHaveLength(2);

      expect(comments[0].id).toBeDefined();
      expect(comments[0].username).toEqual('johndoe');
      expect(typeof comments[0].date).toEqual('string');
      expect(comments[0].content).toEqual('sebuah comment');

      expect(comments[1].id).toBeDefined();
      expect(comments[1].username).toEqual('dicoding');
      expect(typeof comments[1].date).toEqual('string');
      expect(comments[1].content).toEqual('**komentar telah dihapus**');
    });

    it('should response 404 if getting detail thread to invalid thread', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidThreadId = 'thread-xxxx';

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${invalidThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
