import * as express from 'express';
import Post from "./post.interface";

class PostsController {
    public path = '/posts';
    public router = express.Router();

    private posts: Post[] = [
        {
            author: 'Marcin',
            content: 'Dolor sit amet',
            title: 'Lorem Ipsum',
        }
    ];

    constructor() {
        this.initializeRoutes();
    }

    /**
     * The getAllPosts and createAPost are arrow functions because they access properties of an instance of the class.
     * Since they are passed to the router and not called directly, the context changes.
     * You can achieve the same result by calling  this.router.get(this.path, this.getAllPosts.bind(this))
     */
    public initializeRoutes() {
        // this.router.post(this.path, this.createPost.bind(this));
        // this.router.get(this.path, this.getAllPosts.bind(this));
        this.router.post(this.path, this.createPost);
        this.router.get(this.path, this.getAllPosts);
    }

    getAllPosts = (request: express.Request, response: express.Response) => {
        return response.send(this.posts);
    }

    createPost = (request: express.Request, response: express.Response) => {
        const post: Post = request.body;
        this.posts.push(post);
        return response.send(post);
    }

    // private getAllPosts(request: express.Request, response: express.Response) {
    //     return response.send(this.posts);
    // }
    //
    // private createPost(request: express.Request, response: express.Response) {
    //     const post: Post = request.body;
    //     this.posts.push(post);
    //     return response.send(post);
    // }
}

export default PostsController;
