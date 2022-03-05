import * as express from 'express';
import Post from "./post.interface";
import postModel from "./posts.model";
import Controller from "../interfaces/controller.interface";
import PostNotFoundException from "../exceptions/PostNotFoundException";

class PostsController implements Controller {
    public path = '/posts';
    public router = express.Router();
    private postModel = postModel;

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
        this.router.get(this.path, this.getAllPosts);
        this.router.get(`${this.path}/:id`, this.getPostById);
        this.router.post(this.path, this.createPost);
        this.router.patch(`${this.path}/:id`, this.modifyPost);
        this.router.delete(`${this.path}/:id`, this.deletePost);
    }

    private getAllPosts = (request: express.Request, response: express.Response) => {
        this.postModel.find()
            .then((posts) => {
                return response.send(posts);
            })
    }

    private getPostById = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        this.postModel.findById(id)
            .then((post) => {
                if (post) return response.send(post);
                next(new PostNotFoundException(id));
            })
    }

    private modifyPost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const postData: Post = request.body;
        this.postModel.findByIdAndUpdate(id, postData, { new: true })
            .then((post) => {
                if (post) return response.send(post);
                next(new PostNotFoundException(id));
            });
    }

    private createPost = (request: express.Request, response: express.Response) => {
        const postData: Post = request.body;
        const createdPost = new this.postModel(postData);
        return createdPost.save()
            .then((savedPost) => {
                return response.send(savedPost);
            })
            .catch((err) => {
                console.error(err);
            })
    }

    private deletePost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        this.postModel.findByIdAndDelete(id)
            .then((successResponse) => {
                if (successResponse) return response.send(200);
                next(new PostNotFoundException(id));
            });
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
