import mongoose from "mongoose";
import PostSchemaDefault, * as schemas from "./BlogSchemas";
import {PostSchema} from "./BlogSchemas";

mongoose.model("Post_NamedImport", PostSchema, "posts");
mongoose.model("Post_NamespaceImport", schemas.PostSchema, "posts");
mongoose.model("Post_DefaultImport", PostSchemaDefault, "posts");
