import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {type:String, required: true},
    username: {type:String, unique: true, required:true},
    password: {type:String, required: true}
});

const tagSchema = new Schema({
    title: {type: String, required: true, unique: true}
})

const contentTypes = ['image','video','article','audio'];

const contentSchema = new Schema({
    link: {type: String, required: true},
    title: {type: String, required: true},
    type: {type: String, enum: contentTypes, required: true},
    tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
    userId: {type: mongoose.Types.ObjectId, ref:'User', required:true, 
        validate: async function(value: String) {
            const user = await UserModel.findById(value);
            if(!user){
                throw new Error('User does not exist');
            }
        }
    },
})

const linkSchema = new Schema({
    hash: {type: String, required: true},
    userId: {type: mongoose.Types.ObjectId, ref:' User', required: true,
        validate: async function(value: String) {
            const user = await UserModel.findById(value);
            if(!user){
                throw new Error('User does not exist');
            }
        }
    }
})

export const UserModel = model('User', userSchema);
export const ContentModel = model('Content', contentSchema);
export const TagModel = model('Tag', tagSchema);
export const LinkModel = model('Link', linkSchema);