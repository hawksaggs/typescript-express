import * as express from 'express';
import Post from "./post.interface";
import postModel from "./posts.model";
import Controller from "../interfaces/controller.interface";
import PostNotFoundException from "../exceptions/PostNotFoundException";
import validationMiddleware from "../middlewares/validation.middleware";
import CreatePostDto from "./posts.dto";
import authMiddleware from "../middlewares/auth.middleware";
import RequestWithUser from "../interfaces/requestWithUser.interface";

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
        this.router
            .all(`${this.path}/*`, authMiddleware)
            .post(this.path, authMiddleware, validationMiddleware(CreatePostDto) , this.createPost)
            .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
            .delete(`${this.path}/:id`, this.deletePost);
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

    private modifyPost = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const postData: Post = request.body;

        const post = await this.postModel.findByIdAndUpdate(id, postData, { new: true })

        if (post) return response.send(post);
        next(new PostNotFoundException(id));
    }

    private createPost = async (request: RequestWithUser, response: express.Response) => {
        const postData: CreatePostDto = request.body;
        const createdPost = new this.postModel({
            ...postData,
            authorId: request.user._id
        });
        const savedPost = await createdPost.save();

        return response.send(savedPost);
    }

    private deletePost = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const successResponse = await this.postModel.findByIdAndDelete(id)
        if (successResponse) return response.send(200);
        next(new PostNotFoundException(id));
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
