/* istanbul ignore file */
import { Express } from "express";

import userRouter from "../endpoints/user/UserRoute";
import threadRouter from "../endpoints/thread/ThreadRoute";
import threadPageRouter from "../endpoints/threadpage/ThreadPageRoute";
import subForumRouter from "../endpoints/subforum/SubForumRoute";
import postRouter from "../endpoints/post/PostRoute";
import loginRouter from "../endpoints/login/LoginRouter";

export default function routes(app: Express) {

    // ------------------------------------------------------------------------- USER ROUTES --------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/user/{id}:
     *  get:
     *     tags:
     *     - User
     *     summary: Gets user by id
     *     description: Returns one specific user, if he is created and found.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: The id of the user
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *     responses:
     *       200:
     *         description: Successful operation. Returns user data.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   format: mongo id
     *                 name:
     *                   type: string
     *                   description: Name of the user
     *                 email:
     *                   type: string
     *                   format: email
     *                   description: Email of the user
     *       400:
     *         description: Bad Request. Indicates invalid parameters or failure in fetching user data.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     */
    app.get("/api/user/:id", userRouter);

    /**
     * @openapi
     * /api/user/{id}/avatar:
     *  get:
     *     tags:
     *     - User
     *     summary: Gets user avatar by id
     *     description: Retrieves the avatar URL of a user based on the provided ID.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: id of the user to retrieve the avatar for
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *     responses:
     *       200:
     *         description: Successful operation. Returns the avatar URL.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 avatar:
     *                   type: string
     *                   description: URL of the user's avatar
     *       400:
     *         description: Bad request. Indicates invalid parameters or failure in fetching the avatar.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     */
    app.get("/api/user/:id/avatar", userRouter);

    /**
     * @openapi
     * /api/user/{id}/verify/{token}:
     *  get:
     *     tags:
     *     - User
     *     summary: Verifies user
     *     description: This route verifies a user using an ID and token and updating their status upon successful validation.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: User id for verification 
     *        schema:
     *           type: string
     *           format: mongo id
     *        required: true
     *      - name: token
     *        in: path
     *        description: Verification token
     *        schema:
     *           type: string
     *        required: true
     *     responses:
     *       201:
     *         description: User successfully verified
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Success message
     *       400:
     *         description: Bad request or validation failed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     */
    app.get("/api/user/:id/verify/:token", userRouter);

    /**
     * @openapi
     * '/api/user':
     *  post:
     *     tags:
     *     - User
     *     summary: Creates new user
     *     description: Creates a new user with name, email, and password and sends a verification email.
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *              type: object
     *              required:
     *                - name
     *                - email
     *                - password
     *              properties:
     *                name:
     *                  type: string
     *                  minLength: 3
     *                  maxLength: 20
     *                  default: Jane Doe
     *                email:
     *                  type: string
     *                  format: email
     *                  minLength: 1
     *                  maxLength: 100
     *                  default: janedoe@example.com
     *                password:
     *                  type: string
     *                  minLength: 1
     *                  maxLength: 100
     *                  default: stringPassword123!
     *                mod:
     *                  type: boolean
     *                  default: false
     *                admin:
     *                  type: boolean
     *                  default: false
     *                verified:
     *                  type: boolean
     *                  default: false
     *                avatar:
     *                  type: string
     *                  default: ""
     *                createdAt:
     *                  type: string
     *     responses:
     *      201:
     *        description: Success
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                _id:
     *                  type: string
     *                name:
     *                  type: string
     *                email:
     *                  type: string
     *                mod:
     *                  type: boolean
     *                admin:
     *                  type: boolean
     *                verified:
     *                  type: boolean
     *                avatar:
     *                  type: string
     *                createdAt:
     *                  type: string
     *      400:
     *        description: Bad request or validation failed
     *      409:
     *        description: User already exists
     */
    app.post("/api/user", userRouter);

    /**
     * @openapi
     * '/api/user/{id}/threads':
     *  post:
     *     tags:
     *     - User
     *     summary: Gets threads for a user
     *     description: Retrieves threads associated with a user by their id.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: The id of the user
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *      - name: count
     *        in: query
     *        description: Number of threads to retrieve (optional)
     *        schema:
     *          type: integer
     *          format: int32
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *              type: object
     *              required:
     *                - name
     *                - email
     *                - password
     *              properties:
     *                name:
     *                  type: string
     *                  default: Jane Doe
     *                email:
     *                  type: string
     *                  default: janedoe@example.com
     *                password:
     *                  type: string
     *                  default: stringPassword123!
     *                mod:
     *                  type: boolean
     *                  default: false
     *                admin:
     *                  type: boolean
     *                  default: false
     *                verified:
     *                  type: boolean
     *                  default: false
     *                avatar:
     *                  type: string
     *                  default: ""
     *                createdAt:
     *                  type: string
     *     responses:
     *      200:
     *        description: Successfully retrieved threads for the user
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                type: object
     *                properties:
     *                  threadId:
     *                    type: string
     *                    description: Unique identifier for the thread
     *                  title:
     *                    type: string
     *                    description: Title of the thread
     *                  content:
     *                    type: string
     *                    description: Content of the thread
     *                  createdAt:
     *                    type: string
     *                    format: date-time
     *                    description: Date and time when the thread was created
     *      400:
     *        description: Bad request or validation failed
     *      401:
     *        description: Unauthorized, authentication required
     *      404:
     *        description: User not found or threads not available
     */
    app.post("/api/user/:id/threads", userRouter);

     /**
     * @openapi
     * /api/user/{id}:
     *  put:
     *     tags:
     *     - User
     *     summary: Updates user details by id
     *     description: Updates user details based on the provided id (user can change their name, email, password and avatar).
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: The id of the user
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: User's name (must be a string)
     *                 default: New user name
     *               email:
     *                 type: string
     *                 format: email
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: User's email (must be a valid email address)
     *                 default: newEmail@example.com
     *               password:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: User's password (must be a strong password)
     *                 default: New user password
     *               admin:
     *                 type: boolean
     *                 description: Indicates if the user has admin privileges
     *                 default: false
     *               mod:
     *                 type: boolean
     *                 description: Indicates if the user has moderator privileges
     *                 default: false
     *               avatar:
     *                 type: string
     *                 description: User's avatar (string)
     *                 default: newAvatar.jpg
     *     responses:
     *       200:
     *         description: User details updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 avatar:
     *                   type: string
     *                   description: Updated user's avatar
     *                 email:
     *                   type: string
     *                   description: Updated user's email
     *                 admin:
     *                   type: boolean
     *                   description: Updated admin status
     *                 mod:
     *                   type: boolean
     *                   description: Updated mod status
     *                 name:
     *                   type: string
     *                   description: Updated user's name
     *       400:
     *         description: Bad request or validation failed
     *       401:
     *         description: Unauthorized, authentication required
     *       409:
     *         description: Duplicate user or conflict during update
     *       404:
     *         description: User not found
     */
    app.put("/api/user/:id", userRouter);

    /**
     * @openapi
     * /api/user/image/{id}:
     *  put:
     *     tags:
     *     - User
     *     summary: Updates the image of user
     *     description: Updates the image (avatar) of a user based on the provided id.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: The id of the user
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: User's name
     *                 default: New user name
     *               email:
     *                 type: string
     *                 format: email
     *                 description: User's email
     *                 default: NewEmail@example.com
     *               data:
     *                 type: object
     *                 properties:
     *                   avatar:
     *                     type: string
     *                     description: User's updated avatar
     *                     default: NewAvatar.jpg
     *     responses:
     *       200:
     *         description: User avatar updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: User id
     *                 name:
     *                   type: string
     *                   description: Updated user's name
     *                 email:
     *                   type: string
     *                   description: Updated user's email
     *                 avatar:
     *                   type: string
     *                   description: Updated user's avatar
     *       400:
     *         description: Bad request or validation failed
     *       404:
     *         description: User not found
     */
    app.put("/api/user/image/:id", userRouter);

    /**
     * @openapi
     * /api/user/{id}:
     *  delete:
     *     tags:
     *     - User
     *     summary: Deletes user by its id
     *     description: Deletes a user based on the provided id.
     *     parameters:
     *      - name: userId
     *        in: path
     *        description: The id of the user
     *        schema:
     *          type: string
     *          format: mongo id
     *        required: true
     *     responses:
     *       204:
     *         description: User deleted successfully
     *       400:
     *         description: Bad request or validation failed
     *       401:
     *         description: Unauthorized, authentication required
     *       404:
     *         description: User not found
     */
    app.delete("/api/user/:id", userRouter);

    // ----------------------------------------------------------------------- THREAD ROUTES --------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/thread/{id}:
     *  get:
     *     tags:
     *     - Thread
     *     summary: Retrieves thread by id
     *     description: Retrieves a specific thread by its id, if created and found.
     *     parameters:
     *      - name: threadId
     *        in: path
     *        description: The id of the thread
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       200:
     *         description: Successful response with the requested thread
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The unique identifier of the thread
     *                 title:
     *                   type: string
     *                   description: The title of the thread
     *                 creator:
     *                   type: string
     *                   description: The id of the thread creator
     *                 subForum:
     *                   type: string
     *                   description: The subforum associated with the thread
     *                 numPosts:
     *                   type: number
     *                   description: The number of posts in the thread
     *                 pages:
     *                   type: array
     *                   items:
     *                    type: string
     *                    description: Array of ThreadPage ids
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The timestamp when the thread was created
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     *       404:
     *         description: Thread not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.get("/api/thread/:id", threadRouter);

    /**
     * @openapi
     * /api/thread/find/{query}:
     *  get:
     *     tags:
     *     - Thread
     *     summary: Retrieves title of thread by query
     *     description: Retrieves the title of a thread matching the provided query string.
     *     parameters:
     *      - name: query
     *        in: path
     *        description: Query string to search for threads
     *        schema:
     *          type: string
     *          minLength: 2
     *          maxLength: 100
     *        required: true
     *     responses:
     *       200:
     *         description: Successful response with threads matching the query
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The unique identifier of the thread
     *                   title:
     *                     type: string
     *                     description: The title of the thread
     *                   creator:
     *                     type: string
     *                     description: The ID of the thread creator
     *                   subForum:
     *                     type: string
     *                     description: The subforum associated with the thread
     *                   numPosts:
     *                     type: number
     *                     description: The number of posts in the thread
     *                   pages:
     *                     type: array
     *                     items:
     *                       type: string
     *                       description: Array of ThreadPage IDs
     *                   createdAt:
     *                     type: string
     *                     format: date-time
     *                     description: The timestamp when the thread was created
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     *       404:
     *         description: Thread not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.get("/api/thread/find/:query", threadRouter);

    /**
     * @openapi
     * /api/thread:
     *  post:
     *     tags:
     *     - Thread
     *     summary: Creates new thread
     *     description: Creates a new thread with provided details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The title of the thread
     *                 default: Thread title
     *               subForum:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The subforum associated with the thread
     *                 default: Example subforum
     *               numPosts:
     *                 type: integer
     *                 minimum: 0
     *                 description: The number of posts in the thread (optional)
     *                 default: 0
     *               creator:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The id of the thread creator
     *               content:
     *                 type: string
     *                 minLength: 1
     *                 description: The content of the initial post (optional)
     *                 default: New content
     *     responses:
     *       201:
     *         description: Thread created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The unique identifier of the created thread
     *                 title:
     *                   type: string
     *                   description: The title of the created thread
     *                 creator:
     *                   type: string
     *                   description: The ID of the thread creator
     *                 subForum:
     *                   type: string
     *                   description: The subforum associated with the created thread
     *                 numPosts:
     *                   type: number
     *                   description: The number of posts in the created thread
     *                 pages:
     *                   type: array
     *                   items:
     *                     type: string
     *                     description: Array of ThreadPage IDs
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The timestamp when the thread was created
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.post("/api/thread", threadRouter);

    /**
     * @openapi
     * /api/thread/{id}:
     *  put:
     *     tags:
     *     - Thread
     *     summary: Updates thread by id
     *     description: Updates a specific thread by its id.
     *     parameters:
     *      - name: threadId
     *        in: path
     *        description: The id of the thread
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The updated title of the thread
     *                 default: New title
     *               subForum:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The updated subforum associated with the thread
     *                 default: Example subforum
     *               numPosts:
     *                 type: integer
     *                 minimum: 0
     *                 description: The updated number of posts in the thread (optional)
     *                 default: 0
     *               creator:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: The updated id of the thread creator
     *     responses:
     *       200:
     *         description: Thread updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The unique identifier of the updated thread
     *                 title:
     *                   type: string
     *                   description: The updated title of the thread
     *                 creator:
     *                   type: string
     *                   description: The updated id of the thread creator
     *                 subForum:
     *                   type: string
     *                   description: The updated subforum associated with the thread
     *                 numPosts:
     *                   type: number
     *                   description: The updated number of posts in the thread
     *                 pages:
     *                   type: array
     *                   items:
     *                     type: string
     *                     description: Array of ThreadPage IDs
     *       400:
     *         description: Invalid request due to validation errors or error during update
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     *       403:
     *         description: Forbidden - User is not the creator of the thread
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.put("/api/thread/:id", threadRouter);

    /**
     * @openapi
     * /api/thread/{id}:
     *  delete:
     *     tags:
     *     - Thread
     *     summary: Deletes thread by id
     *     description: Deletes a specific thread by its id.
     *     parameters:
     *      - name: threadId
     *        in: path
     *        description: The id of the thread
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       204:
     *         description: Thread deleted successfully
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     *       403:
     *         description: Forbidden - User is not the creator of the thread
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       404:
     *         description: Thread not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.delete("/api/thread/:id", threadRouter);

    // --------------------------------------------------------------------- THREADPAGE ROUTES --------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/threadpage/{id}:
     *  get:
     *     tags:
     *     - ThreadPage
     *     summary: Gets threadpage by id
     *     description: Retrieves a threadpage based on the provided id, if created and found.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       200:
     *         description: Successful operation. Returns the requested thread page.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The ID of the thread page
     *                 posts:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       content:
     *                         type: string
     *                         description: The content of the post
     *                       author:
     *                         type: string
     *                         description: The ID of the author of the post
     *                       upvotes:
     *                         type: integer
     *                         description: The number of upvotes for the post
     *                       downvotes:
     *                         type: integer
     *                         description: The number of downvotes for the post
     *                       modified:
     *                         type: string
     *                         description: Indicates if the post has been modified (optional)
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The timestamp when the thread page was created
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: Thread page not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.get("/api/threadpage/:id", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage/authors/{id}:
     *  get:
     *     tags:
     *     - ThreadPage
     *     summary: Gets authors of posts on a threadpage by id
     *     description: Retrieves authors of posts on a specific threadpage based on the provided id, if created and found.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       200:
     *         description: Successful operation. Returns the authors of posts on the specified thread page.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 authors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       id:
     *                         type: string
     *                         description: The ID of the author
     *                       name:
     *                         type: string
     *                         description: The name of the author
     *                       admin:
     *                         type: boolean
     *                         description: Indicates if the author is an admin (true/false)
     *                       mod:
     *                         type: boolean
     *                         description: Indicates if the author is a moderator (true/false)
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         description: The timestamp when the author was created
     *                       avatar:
     *                         type: string
     *                         description: The avatar of the author
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: Thread page or author not found.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.get("/api/threadpage/authors/:id", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage:
     *  post:
     *     tags:
     *     - ThreadPage
     *     summary: Creates new threadpage
     *     description: Creates a new threadpage with provided posts.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               posts:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     content:
     *                       type: string
     *                       description: The content of the post
     *                     author:
     *                       type: string
     *                       description: The id of the author
     *     responses:
     *       201:
     *         description: ThreadPage created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the created ThreadPage
     *                 posts:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       content:
     *                         type: string
     *                         description: The content of the post
     *                       author:
     *                         type: string
     *                         description: The id of the author
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         description: The timestamp when the post was created
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     */
    app.post("/api/threadpage", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage/{id}:
     *  put:
     *     tags:
     *     - ThreadPage
     *     summary: Updates threadpage by id
     *     description: Updates a threadpage based on the provided id with new posts.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               posts:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     content:
     *                       type: string
     *                       description: The content of the post
     *                     author:
     *                       type: string
     *                       description: The id of the author
     *     responses:
     *       200:
     *         description: ThreadPage updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the updated ThreadPage
     *                 posts:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       content:
     *                         type: string
     *                         description: The content of the post
     *                       author:
     *                         type: string
     *                         description: The id of the author
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         description: The timestamp when the post was created
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: ThreadPage not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.put("/api/threadpage/:id", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage/{id}/add:
     *  patch:
     *     tags:
     *     - ThreadPage
     *     summary: Adds a new post to a threadpage
     *     description: Adds a new post to a threadpage specified by id.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               author:
     *                 type: string
     *                 format: mongoId
     *                 description: The ID of the author of the post
     *               content:
     *                 type: string
     *                 description: The content of the post
     *               threadID:
     *                 type: string
     *                 format: mongoId
     *                 description: The id of the thread associated with the ThreadPage
     *     responses:
     *       200:
     *         description: Post added to ThreadPage successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The ID of the updated ThreadPage
     *                 posts:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       content:
     *                         type: string
     *                         description: The content of the post
     *                       author:
     *                         type: string
     *                         description: The ID of the author
     *                       createdAt:
     *                         type: string
     *                         format: date-time
     *                         description: The timestamp when the post was created
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: ThreadPage or Thread not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.patch("/api/threadpage/:id/add", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage/{id}/edit:
     *  patch:
     *     tags:
     *     - ThreadPage
     *     summary: Edits a post in a threadpage
     *     description: Edits a specific post in a threadpage specified by id.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               author:
     *                 type: string
     *                 format: mongoId
     *                 description: The id of the author of the post to edit
     *               content:
     *                 type: string
     *                 description: The updated content of the post
     *               postNum:
     *                 type: number
     *                 description: The index number of the post to be edited within the ThreadPage
     *               modified:
     *                 type: string
     *                 description: Optional - "m" for modified or "d" for deleted
     *                 enum:
     *                   - m
     *                   - d
     *     responses:
     *       200:
     *         description: Post in ThreadPage edited successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the updated ThreadPage
     *                 posts:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       content:
     *                         type: string
     *                         description: The updated content of the post
     *                       modified:
     *                         type: string
     *                         enum:
     *                           - m
     *                           - d
     *                         description: The status of modification for the post ("m" for modified, "d" for deleted)
     *       400:
     *         description: Invalid, validation errors or missing parameters.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *       404:
     *         description: ThreadPage not found or Post doesn't exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.patch("/api/threadpage/:id/edit", threadPageRouter);

    /**
     * @openapi
     * /api/threadpage/{id}:
     *  delete:
     *     tags:
     *     - ThreadPage
     *     summary: Deletes threadpage by id
     *     description: Deletes a threadpage specified by id.
     *     parameters:
     *      - name: threadPageId
     *        in: path
     *        description: The id of the threadPage
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       204:
     *         description: ThreadPage deleted successfully
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                         description: Error message
     *                       param:
     *                         type: string
     *                         description: Parameter related to the error
     *       404:
     *         description: ThreadPage not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     */
    app.delete("/api/threadpage/:id", threadPageRouter);

    // -------------------------------------------------------------------- SUBFORUM ROUTES --------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/subforum/{name}:
     *  get:
     *     tags:
     *     - SubForum
     *     summary: Gets subForum by name
     *     description: Retrieves a specific subForum by its name, if created and found.
     *     parameters:
     *      - name: subForumName
     *        in: path
     *        description: The name of the subForum
     *        schema:
     *          type: string
     *        required: true
     *     responses:
     *       200:
     *         description: Successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the SubForum
     *                 name:
     *                   type: string
     *                   description: The name of the SubForum
     *                 description:
     *                   type: string
     *                   description: The description of the SubForum
     *                 threads:
     *                    type: array
     *                    items:
     *                     type: string
     *                     description: Thread id
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     *       404:
     *         description: SubForum not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     */
    app.get("/api/subforum/:name", subForumRouter);

    /**
     * @openapi
     * /api/subforum:
     *  get:
     *     tags:
     *     - SubForum
     *     summary: Gets all subForums
     *     description: Retrieves all existing subForums.
     *     responses:
     *       200:
     *         description: Successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The id of the SubForum
     *                   name:
     *                     type: string
     *                     description: The name of the SubForum
     *                   description:
     *                     type: string
     *                     description: The description of the SubForum
     *                   threads:
     *                     type: array
     *                     items:
     *                       type: string
     *                       description: Thread id
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     */
    app.get("/api/subforum", subForumRouter);

    /**
     * @openapi
     * /api/subforum/{name}/threads:
     *  post:
     *     tags:
     *     - SubForum
     *     summary: Gets threads for a specific subForum
     *     description: Returns all threads for a specific subforum, optionally limited by count.
     *     parameters:
     *      - name: subForumName
     *        in: path
     *        description: The name of the subForum
     *        schema:
     *          type: string
     *        required: true
     *      - name: count
     *        in: query
     *        description: The number of threads to retrieve
     *        schema:
     *          type: integer
     *          minimum: 0
     *     responses:
     *       200:
     *         description: Successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The id of the thread
     *                   title:
     *                     type: string
     *                     description: The title of the thread
     *                   creator:
     *                     type: string
     *                     description: The id of the thread's creator
     *                   subForum:
     *                     type: string
     *                     description: The SubForum the thread belongs to
     *                   numPosts:
     *                     type: integer
     *                     description: The number of posts in the thread
     *                   pages:
     *                     type: integer
     *                     description: The number of pages in the thread
     *                   creatorName:
     *                     type: string
     *                     description: The name of the thread's creator
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     */
    app.post("/api/subforum/:name/threads", subForumRouter);

    /**
     * @openapi
     * /api/subforum/threads:
     *  post:
     *     tags:
     *     - SubForum
     *     summary: Gets latest threads from subForums
     *     description: Fetches the latest threads from specified subForums.
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               threadCount:
     *                 type: integer
     *                 description: Number of threads to retrieve per SubForum
     *                 minimum: 0
     *               subForumCount:
     *                 type: integer
     *                 description: Number of SubForums to consider
     *                 minimum: 0
     *     responses:
     *       200:
     *         description: Successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     description: The id of the thread
     *                   title:
     *                     type: string
     *                     description: The title of the thread
     *                   creator:
     *                     type: string
     *                     description: The id of the thread's creator
     *                   subForum:
     *                     type: string
     *                     description: The SubForum the thread belongs to
     *                   numPosts:
     *                     type: integer
     *                     description: The number of posts in the thread
     *                   pages:
     *                     type: integer
     *                     description: The number of pages in the thread
     *                   createdAt:
     *                     type: string
     *                     description: The creation date of the thread
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     */
    app.post("/api/subforum/threads", subForumRouter);

    /**
     * @openapi
     * /api/subforum:
     *  post:
     *     tags:
     *     - SubForum
     *     summary: Creates new subForum
     *     description: Creates a new subForum if the user has admin permissions.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: The name of the SubForum to be created
     *               description:
     *                 type: string
     *                 description: Description of the SubForum (optional)
     *               threads:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of thread ids (optional)
     *     responses:
     *       201:
     *         description: SubForum created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the newly created SubForum
     *                 name:
     *                   type: string
     *                   description: The name of the SubForum
     *                 description:
     *                   type: string
     *                   description: Description of the SubForum
     *                 threads:
     *                   type: array
     *                   items:
     *                     type: string
     *                   description: Array of thread ids associated with the SubForum
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   description: Error message
     *       403:
     *         description: Forbidden - Permission denied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: Error message for permission denial
     */
    app.post("/api/subforum", subForumRouter);

    /**
     * @openapi
     * /api/subforum/{name}:
     *  put:
     *     tags:
     *     - SubForum
     *     summary: Updates subForum
     *     description: Updates an existing subForum if the user has admin permissions.
     *     parameters:
     *      - name: subForumName
     *        in: path
     *        description: The name of the subForum
     *        schema:
     *          type: string
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               id:
     *                 type: string
     *                 description: The id of the subForum to be updated
     *               name:
     *                 type: string
     *                 description: The new name for the subForum
     *               description:
     *                 type: string
     *                 description: The new description for the subForum
     *               threads:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of thread ids associated with the subForum
     *     responses:
     *       200:
     *         description: SubForum updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the updated SubForum
     *                 name:
     *                   type: string
     *                   description: The updated name of the SubForum
     *                 description:
     *                   type: string
     *                   description: The updated description of the SubForum
     *                 threads:
     *                   type: array
     *                   items:
     *                     type: string
     *                   description: The updated array of thread IDs associated with the SubForum
     *       400:
     *         description: Bad request - Validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 Validation errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     *       403:
     *         description: Forbidden - Permission denied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: Error message for permission denial
     */
    app.put("/api/subforum/:name", subForumRouter);

    /**
     * @openapi
     * /api/subforum/{id}:
     *  delete:
     *     tags:
     *     - SubForum
     *     summary: Deletes subForum
     *     description: Deletes an existing subForum by id, if the user has admin permissions.
     *     parameters:
     *      - name: subForumId
     *        in: path
     *        description: The id of the subForum
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       204:
     *         description: SubForum deleted successfully
     *       400:
     *         description: Bad request - Validation errors or subForum not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     *       403:
     *         description: Forbidden - Permission denied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: Error message for permission denial
     */
    app.delete("/api/subforum/:name", subForumRouter);

    // ---------------------------------------------------------------------- POST ROUTES ----------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/post/{id}:
     *  get:
     *     tags:
     *     - Post
     *     summary: Gets post by id
     *     description: Retrieves a specific post by its id, if created and found.
     *     parameters:
     *      - name: postId
     *        in: path
     *        description: The id of the post
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       200:
     *         description: OK. Post retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the post
     *                 content:
     *                   type: string
     *                   description: The content of the post
     *                 author:
     *                   type: string
     *                   description: The id of the author
     *                 upvotes:
     *                   type: integer
     *                   description: Number of upvotes
     *                 downvotes:
     *                   type: integer
     *                   description: Number of downvotes
     *                 modified:
     *                   type: string
     *                   enum: ["", "m", "d"]
     *                   description: Indicates if the post is modified or deleted
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The date and time the post was created
     *       400:
     *         description: Invalid request due to validation errors or Post not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     */
    app.get("/api/post/:id", postRouter);

    /**
     * @openapi
     * /api/post:
     *  post:
     *     tags:
     *     - Post
     *     summary: Creates new post
     *     description: Creates a new post with the provided content and author.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               author:
     *                 type: string
     *                 description: The id of the author creating the post
     *               content:
     *                 type: string
     *                 description: The content of the post
     *               upvotes:
     *                 type: integer
     *                 description: Number of upvotes (optional)
     *               downvotes:
     *                 type: integer
     *                 description: Number of downvotes (optional)
     *     responses:
     *       201:
     *         description: New Post created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the newly created post
     *                 content:
     *                   type: string
     *                   description: The content of the post
     *                 author:
     *                   type: string
     *                   description: The id of the author
     *                 upvotes:
     *                   type: integer
     *                   description: Number of upvotes
     *                 downvotes:
     *                   type: integer
     *                   description: Number of downvotes
     *                 modified:
     *                   type: string
     *                   enum: ["", "m", "d"]
     *                   description: Indicates if the post is modified or deleted
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The date and time the post was created
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     */
    app.post("/api/post", postRouter);

    /**
     * @openapi
     * /api/post/{id}:
     *  put:
     *     tags:
     *     - Post
     *     summary: Updates post by id
     *     description: Updates a post based on the provided id with the given content, author, upvotes, or downvotes.
     *     parameters:
     *      - name: postId
     *        in: path
     *        description: The id of the post
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               author:
     *                 type: string
     *                 description: The id of the author updating the post
     *               content:
     *                 type: string
     *                 description: The updated content of the post
     *               upvotes:
     *                 type: integer
     *                 description: Updated number of upvotes (optional)
     *               downvotes:
     *                 type: integer
     *                 description: Updated number of downvotes (optional)
     *     responses:
     *       200:
     *         description: Post updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   description: The id of the updated post
     *                 content:
     *                   type: string
     *                   description: The updated content of the post
     *                 author:
     *                   type: string
     *                   description: The id of the author
     *                 upvotes:
     *                   type: integer
     *                   description: Updated number of upvotes
     *                 downvotes:
     *                   type: integer
     *                   description: Updated number of downvotes
     *                 modified:
     *                   type: string
     *                   enum: ["", "m", "d"]
     *                   description: Indicates if the post is modified or deleted
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                   description: The date and time the post was created
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *                       param:
     *                         type: string
     */
    app.put("/api/post/:id", postRouter);

    /**
     * @openapi
     * /api/post/{id}:
     *  delete:
     *     tags:
     *     - Post
     *     summary: Deletes post by id
     *     description: Deletes a post based on the provided id.
     *     parameters:
     *      - name: postId
     *        in: path
     *        description: The id of the post
     *        schema:
     *          type: string
     *          format: mongoId
     *        required: true
     *     responses:
     *       204:
     *         description: Post deleted successfully
     *       400:
     *         description: Invalid request due to validation errors or the post does not exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     */
    app.delete("/api/post/:id", postRouter);

    // ---------------------------------------------------------------------- LOGIN ROUTES ----------------------------------------------------------------------------------

    /**
     * @openapi
     * /api/login:
     *  post:
     *     tags:
     *     - Login
     *     summary: Authenticate user and generate JWT
     *     description: This route is used to authenticate an already existing user. The user sends his/her email address and password and receives a JSON Web Token (JWT) if the authentication is successful.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               access_token:
     *                 type: string
     *                 description: The JWT
     *               token_type:
     *                 type: string
     *                 enum: [Bearer]
     *                 description: Constant value
     *             required:
     *               - access_token
     *               - token_type 
     *     responses:
     *       201:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 access_token:
     *                   type: string
     *                   description: The JWT
     *                 token_type:
     *                   type: string
     *                   enum: [Bearer]
     *                   description: Constant value
     *       400:
     *         description: Invalid request due to validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     *       401:
     *         description: Can't create JWT or unauthorized login attempt
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       403:
     *         description: Not authorized. Email verification required.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       405:
     *         description: Invalid request due to server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       msg:
     *                         type: string
     */
    app.post("/api/login", loginRouter);
}
