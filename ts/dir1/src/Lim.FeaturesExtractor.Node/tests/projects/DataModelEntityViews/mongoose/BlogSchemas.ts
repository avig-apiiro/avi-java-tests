import {Schema} from "mongoose";

// embedded schema
const commentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    authorId: Schema.Types.ObjectId,
    date: Date,
    body: String
});

// exported schema
const postSchema = new Schema({
    _id: Schema.Types.ObjectId,
    title: String,
    body: String,
    comments: [commentSchema]
});

export const PostSchema = postSchema;
export default postSchema;
