import { getJWT, getLoginInfo } from "../components/login/LoginContext";
import { AuthorsResource, LoginResource, PostResource, SubforumResource, ThreadPageResource, ThreadResource, UserResource } from "../types/Resources";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export async function login(loginData: { email: string, password: string }): Promise<LoginResource> {
    if (!loginData.email)
        throw new Error("email not defined");
    if (!loginData.password)
        throw new Error("password not defined");

    const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
    });

    if (!response)
        throw String("Something went wrong when connecting to the server, please try again later.");
    if (response.status === 400 || response.status === 401)
        throw String("Your login details are incorrect, please try again.");
    if (response.status === 403)
        throw String("Your account is not verified yet. Please click on the link in the confirmation mail to verify your account.");
    if (response.status === 405)
        throw String("The server encountered an unknown error, pleasy try again later.");
    if (response.status !== 201)
        throw String("An error occurred, please try again.");

    const result: LoginResource = await response.json();
    if (!result.access_token || !result.token_type)
        throw String("The server returned an invalid response, please try again later.");
    return result;
}

export async function register(registrationData: { username: string, email: string, password1: string, password2: string }): Promise<void> {
    if (!registrationData.username)
        throw new Error("username not defined");
    if (!registrationData.email)
        throw new Error("email not defined");
    if (!registrationData.password1)
        throw new Error("first password not defined");
    if (!registrationData.password2)
        throw new Error("second password not defined");
    if (registrationData.password1 !== registrationData.password2)
        throw String("The passwords do not match, please try again.");

    const response = await fetch(`${BASE_URL}/api/user/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: registrationData.username, email: registrationData.email, password: registrationData.password1 })
    });

    if (!response)
        throw String("Something went wrong when connecting to the server, please try again later.");
    if (response.status === 400)
        throw String("Your credentials have been rejected, please make sure the provided email address is valid.");
    if (response.status === 405)
        throw String("The server encountered an unknown error, pleasy try again later.");
    if (response.status !== 201)
        throw String("An error occurred, please try again.");
}

export async function getUser(userID: string): Promise<UserResource> {
    try {
        if (!userID)
            throw new Error("userID not defined");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no jwt found");

        const response = await fetch(`${BASE_URL}/api/user/${userID}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`
            }
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: any = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.id || !result.email || !result.name)
            throw new Error("result from server is missing fields");
        const votedPosts = new Map<string, boolean>();
        result.votedPosts.forEach((obj: { postID: string, vote: boolean }) => { votedPosts.set(obj.postID, obj.vote); });
        result.votedPosts = votedPosts;
        return result as UserResource;

    } catch (error) {
        throw new Error("Error occurred during get: " + error);
    }
}

export async function updateUser(user: UserResource, data: {
    newName?: string, newEmail?: string, oldPassword: string, newPassword1?: string, newPassword2?: string
}, toUpdate: "name" | "email" | "password"): Promise<UserResource> {
    user = Object.assign({}, user);
    if (!user)
        throw new Error("user not defined");
    if (!user.id || !user.name || !user.email)
        throw new Error("user is missing fields");
    if (!data)
        throw new Error("data not defined");
    if (!toUpdate)
        throw new Error("toUpdate not defined");
    if (toUpdate !== "name" && toUpdate !== "email" && toUpdate !== "password")
        throw new Error("toUpdate contains invalid value");
    if (toUpdate === "name" && (!data.newName || !data.oldPassword))
        throw new Error("invalid data for updating username");
    if (toUpdate === "email" && (!data.newEmail || !data.oldPassword))
        throw new Error("invalid data for updating email");
    if (toUpdate === "password" && (!data.oldPassword || !data.newPassword1 || !data.newPassword2))
        throw new Error("invalid data for updating password");
    if (toUpdate === "password" && data.newPassword1 !== data.newPassword2)
        throw String("The new passwords did not match, please try again.");

    const jwt = getJWT();
    if (!jwt)
        throw new Error("no jwt found");
    const loginInfo = getLoginInfo();
    if (!loginInfo || !loginInfo.userID)
        throw new Error("cannot find userID");
    if (user.id !== loginInfo.userID)
        throw new Error("userIDs do not match");

    const bodyData = user as any;
    if (toUpdate === "name") {
        bodyData["name"] = data.newName;
        bodyData["password"] = data.oldPassword;
    } else if (toUpdate === "email") {
        bodyData["email"] = data.newEmail;
        bodyData["password"] = data.oldPassword;
    } else if (toUpdate === "password") {
        bodyData["password"] = data.newPassword1;
    }

    const response = await fetch(`${BASE_URL}/api/user/${bodyData.id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${jwt}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    });

    if (!response)
        throw String("Something went wrong when connecting to the server, please try again later.");
    if (response.status === 400)
        throw String("Your credentials have been rejected, please make sure they fulfil our criteria and try again.");
    if (response.status === 405 && toUpdate === "email")
        throw String("The provided email address is already in use, please enter a different email address.");
    if (response.status === 405 && toUpdate === "name")
        throw String("The provided username is already in use, please enter a different username.");
    if (response.status === 405)
        throw String("The server encountered an unknown error, pleasy try again later.");
    if (response.status !== 200)
        throw String("An error occurred, please try again.");

    const result: any = await response.json();
    if (!result || !result.id || !result.email || !result.name)
        throw new Error("result from server is missing fields");
    const votedPosts = new Map<string, boolean>();
    result.votedPosts.forEach((obj: { postID: string, vote: boolean }) => { votedPosts.set(obj.postID, obj.vote); });
    result.votedPosts = votedPosts;
    return result as UserResource;
}

export async function getThread(threadID: string): Promise<ThreadResource> {
    try {
        if (!threadID)
            throw new Error("threadID not defined");

        const response = await fetch(`${BASE_URL}/api/thread/${threadID}`, {
            method: "GET"
        });
        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: ThreadResource = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.id || !result.pages || !result.title)
            throw new Error("result from server is missing fields");
        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function getThreadPage(threadPageID: string): Promise<ThreadPageResource> {
    try {
        if (!threadPageID)
            throw new Error("threadPageID not defined");

        const response = await fetch(`${BASE_URL}/api/threadpage/${threadPageID}`, {
            method: "GET"
        });
        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: ThreadPageResource & { posts: Array<PostResource & { _id: string }> } = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.id || !result.posts)
            throw new Error("result from server is missing fields");
        result.posts.forEach((post: PostResource & { _id: string }) => {
            post.createdAt = new Date(post.createdAt);
            post.id = post._id;
        });
        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function getAuthors(threadPageID: string): Promise<AuthorsResource> {
    try {
        if (!threadPageID)
            throw new Error("threadPageID not defined");

        const response = await fetch(`${BASE_URL}/api/threadpage/authors/${threadPageID}`, {
            method: "GET"
        });
        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: AuthorsResource = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.authors)
            throw new Error("result from server is missing fields");
        result.authors.forEach((author) => { author.createdAt = new Date(author.createdAt); });
        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function searchThreadsByTitle(title: string): Promise<Array<ThreadResource>> {
    if (!title)
        throw new Error("title not defined");

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}/api/thread/find/${title}`, {
            method: "GET"
        });
    } catch (error) {
        throw String("Could not connect to server, please try again.");
    }

    if (!response)
        throw String("Something went wrong when connecting to the server, please try again later.");
    if (response.status === 400)
        throw String(`Please make sure your query is of appropriate length.`);
    if (response.status === 405)
        throw String("The server encountered an unknown error, pleasy try again later.");
    if (response.status !== 200)
        throw String("An error occurred, please try again.");

    const result: Array<ThreadResource> = await response.json();
    if (!result)
        throw String("The server returned an invalid result, please try again later.");
    result.forEach((thread) => { thread.createdAt = new Date(thread.createdAt); });
    return result;
}

export async function createPost(content: string, userID: string, threadID: string, threadPageID: string): Promise<ThreadPageResource> {
    try {
        if (!content)
            throw new Error("content not defined");
        if (!userID)
            throw new Error("userID not defined");
        if (!threadID)
            throw new Error("threadID not defined");
        if (!threadPageID)
            throw new Error("threadpageID not defined");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no JWT found");

        const response = await fetch(`${BASE_URL}/api/threadpage/${threadPageID}/add`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: content,
                author: userID,
                threadID: threadID
            })
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: ThreadPageResource = await response.json();
        if (!result.id || !result.posts)
            throw new Error("result from server is missing fields");
        result.posts.forEach((post) => { post.createdAt = new Date(post.createdAt); });
        return result;

    } catch (error) {
        throw new Error("error occurred during request: " + error);
    }
}

export async function createThread(creator: string, title: string, subForum: string, content: string): Promise<ThreadResource> {
    try {
        if (!creator)
            throw new Error("userID not defined");
        if (!title)
            throw new Error("title not defined");
        if (!subForum)
            throw new Error("subForum not defined");
        if (!content)
            throw new Error("content not defined");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no JWT found");

        const response = await fetch(`${BASE_URL}/api/thread/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                creator: creator,
                title: title,
                subForum: subForum,
                numPosts: 1,
                content: content
            })
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: ThreadResource = await response.json();
        if (!result.id || !result.pages)
            throw new Error("result from server is missing fields");
        result.createdAt = new Date(result.createdAt);
        return result;

    } catch (error) {
        throw new Error("error occurred during request: " + error);
    }
}


export const updateUserProfilePicture = async (user: UserResource, myFile: string) => {
    const jwt = getJWT();
    if (!jwt) {
        throw new Error("No JWT found");
    }
    try {
        const instance = axios.create({
            baseURL: `${BASE_URL}/api/user/image/${user.id}`,
            timeout: 5000,
        });

        const response = await instance.put(``, {
            headers: {
            },
            data: { avatar: myFile }
        });
        return response
    } catch (error) {
        throw error;
    }
};

export async function getUsersAvatar(userID: string): Promise<string> {
    try {
        if (!userID) {
            throw new Error("userID not defined");
        }

        const response = await fetch(
            `${BASE_URL}/api/user/${userID}/avatar`,
            {
                method: "GET"
            }
        );

        if (!response || !response.ok) {
            throw new Error("network response was not OK");
        }

        const result = await response.json();

        if (result === undefined || result.avatar === undefined) {
            throw new Error("invalid result from server");
        }

        return result.avatar;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function editPost(author: string, content: string, postNum: number, threadPageID: string, modified: "m" | "d" | ""): Promise<ThreadPageResource> {
    try {
        if (!author)
            throw new Error("author not defined");
        if (!content)
            throw new Error("content not defined");
        if (!!postNum === false && postNum !== 0)
            throw new Error("postNum not defined");
        if (!threadPageID)
            throw new Error("threadPageID not defined");
        if (!modified)
            throw new Error("modified not defined");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no JWT found");

        const response = await fetch(`${BASE_URL}/api/threadpage/${threadPageID}/edit`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                postNum: postNum,
                content: content,
                author: author,
                modified: modified
            })
        });

        const result: ThreadPageResource & { posts: Array<PostResource & { _id: string }> } = await response.json();

        if (!result.id || !result.posts) {
            throw new Error("result from server is missing fields");
        }

        result.posts.forEach((post: PostResource & { _id: string }) => {
            post.createdAt = new Date(post.createdAt);
            post.id = post._id;
        });

        return result;

    } catch (error) {
        throw new Error("error occurred during request " + error);
    }
}

export async function getUsersThreads(userID: string, count: number): Promise<ThreadResource[]> {
    try {
        if (!userID) {
            throw new Error("userID not defined");
        }

        const jwt = getJWT();

        if (!jwt) {
            throw new Error("no jwt found");
        }

        const response = await fetch(
            `${BASE_URL}/api/user/${userID}/threads`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    count: count
                })
            }
        );

        if (!response || !response.ok) {
            throw new Error("network response was not OK");
        }

        const result: ThreadResource[] = await response.json();

        if (result === undefined) {
            throw new Error("invalid result from server");
        }

        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function getSubforums(): Promise<SubforumResource[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/api/subforum`,
            {
                method: "GET"
            }
        );

        if (!response || !response.ok) {
            throw new Error("network response was not OK");
        }

        const result: SubforumResource[] = await response.json();

        if (result === undefined) {
            throw new Error("invalid result from server");
        }

        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function getSubforumsThreads(subforumName: string, count: number): Promise<ThreadResource[]> {
    try {
        if (!subforumName) {
            throw new Error("subforumName not defined");
        }

        const response = await fetch(
            `${BASE_URL}/api/subforum/${subforumName}/threads`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    count: count
                })
            }
        );

        if (!response || !response.ok) {
            throw new Error("network response was not OK");
        }

        const result: ThreadResource[] = await response.json();

        if (result === undefined) {
            throw new Error("invalid result from server");
        }

        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function getLatestThreads(subForumCount: number, threadCount: number): Promise<ThreadResource[]> {
    try {
        const response = await fetch(
            `${BASE_URL}/api/subforum/threads`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    subForumCount: subForumCount,
                    threadCount: threadCount
                })
            }
        );

        if (!response || !response.ok) {
            throw new Error("network response was not OK");
        }

        const result: ThreadResource[] = await response.json();

        if (result === undefined) {
            throw new Error("invalid result from server");
        }

        return result;

    } catch (error) {
        throw new Error("Error occurred during request: " + error);
    }
}

export async function votePost(userID: string, postID: string, threadPageID: string, postNum: number, vote: boolean, remove: boolean): Promise<{ votedPosts: Map<string, boolean>, upvotes: number, downvotes: number }> {
    if (!userID) {
        throw new Error("userID not defined");
    }
    if (!postID) {
        throw new Error("postID not defined");
    }
    if (!postID) {
        throw new Error("threadPageID not defined");
    }
    if (postNum === undefined) {
        throw new Error("postNum not defined");
    }
    if (vote === undefined) {
        throw new Error("vote not defined");
    }
    if (remove === undefined) {
        throw new Error("remove not defined");
    }

    const jwt = getJWT();
    if (!jwt) {
        throw new Error("no jwt found");
    }

    const response = await fetch(
        `${BASE_URL}/api/user/vote`,
        {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                postID: postID,
                userID: userID,
                threadPageID: threadPageID,
                postNum: postNum % 10,
                vote: vote,
                remove: remove
            })
        }
    );

    if (!response || response.status !== 200) {
        throw new Error("network response was not OK");
    }

    const result: any = await response.json();
    if (!result)
        throw new Error("invalid result from server");
    if (!result.votedPosts)
        throw new Error("result from server is missing fields");
    const votedPosts = new Map<string, boolean>();
    result.votedPosts.forEach((obj: { postID: string, vote: boolean }) => { votedPosts.set(obj.postID, obj.vote); });
    return { votedPosts: votedPosts, upvotes: result.upvotes, downvotes: result.downvotes };
}

export async function converttobase64(file: any) {
    return new Promise((resolve, reject) => {
        const filereader = new FileReader()
        filereader.readAsDataURL(file)
        filereader.onload = () => {
            resolve(filereader.result)
        }
        filereader.onerror = (err) => { reject(err) }
    })
}
