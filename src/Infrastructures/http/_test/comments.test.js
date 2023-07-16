const container = require('../../container');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{params*} endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    let accessToken;
    let threadId;
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
      const loginResponseJson = JSON.parse(loginResponse.payload);
      accessToken = loginResponseJson.data.accessToken;

      // add thread and get threadId
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'NodeJS with Clean Architecture',
          body: 'Learn build RestFull API with Clean Architecture in NodeJS',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload);
      threadId = addThreadResponseJson.data.addedThread.id;
    });

    it('should response 201 and return added comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Wow Clean Architecture in NodeJS is powerfull!',
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      const { addedComment } = responseJson.data;
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(addedComment).toBeDefined();
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toEqual(requestPayload.content);
      expect(addedComment.owner).toBeDefined();
    });

    it('should response 400 if request payload not contain content', async () => {
      // Arrange
      const requestPayload = {};
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content tidak boleh kosong');
    });

    it('should response 400 if content not string', async () => {
      // Arrange
      const requestPayload = {
        content: ['Dicoding', 'Indonesia'],
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('content harus bertipe data string');
    });

    it('should response 404 when add comment to invalid threads (not found)', async () => {
      // Arrange
      const requestPayload = {
        content: 'NodeJs is better',
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/invalid-id/comments`,
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Thread tidak ditemukan. Id thread tidak terdapat di database'
      );
    });

    it('should response 401 if request headers not contain Authorization: Beared <token>', async () => {
      // Arrange
      const requestPayload = {
        content: 'Javascipt',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 if token in request headers (Authorization: Bearer <token>) is invalid', async () => {
      // Arrange
      const requestPayload = {
        content: 'Dicoding Indonesia is best',
      };
      const invalidToken = 'invalid_token';
      const headers = {
        Authorization: `Bearer ${invalidToken}`,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId} endpoint', () => {
    let accessToken;
    let threadId;
    let commentId;
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
      const loginResponseJson = JSON.parse(loginResponse.payload);
      accessToken = loginResponseJson.data.accessToken;

      // add thread and get threadId
      const addThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'NodeJS with Clean Architecture',
          body: 'Learn build RestFull API with Clean Architecture in NodeJS',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const addThreadResponseJson = JSON.parse(addThreadResponse.payload);
      threadId = addThreadResponseJson.data.addedThread.id;

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'Wow! Clean Architecture is Amazing',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const addCommentResponseJson = JSON.parse(addCommentResponse.payload);
      commentId = addCommentResponseJson.data.addedComment.id;
    });

    it('should response 200 code', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.message).toEqual('Comment berhasil dihapus');
    });

    it('should response 404 if thread is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const notFoundThread = `not-found-thread`;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${notFoundThread}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Thread tidak ditemukan. Id thread tidak terdapat di database'
      );
    });

    it('should response 404 if comment is not found', async () => {
      // Arrange
      const server = await createServer(container);
      const notFoundComment = `not-found-comment`;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${notFoundComment}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Comment tidak ditemukan. Id comment tidak terdapat di database'
      );
    });

    it('should response 403 if user is not the owner of the comment', async () => {
      // Arrange
      const server = await createServer(container);

      // register new user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'newuser',
          password: 'secret',
          fullname: 'New User',
        },
      });

      // login using new user and get accessToken new user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'newuser',
          password: 'secret',
        },
      });

      const loginResponseJson = JSON.parse(loginResponse.payload);
      const differentUserAccessToken = loginResponseJson.data.accessToken;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${differentUserAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resource ini'
      );
    });

    it('should response 401 if headers request not contain Authorization: Bearer <accessToken>', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });

    it('should response 401 if headers request Authorization: Bearer <accessToken> is invalid', async () => {
      // Arrange
      const server = await createServer(container);
      const invalidToken = 'invalid_token';

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${invalidToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
    });
  });
});
