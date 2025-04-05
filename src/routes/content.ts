import { Router } from "express";
import { userMiddleware } from "../middlewares/user";
import { AuthRequest } from "../middlewares/user";
import { ContentModel } from "../schema";
import { TagModel } from "../schema";

export const contentRouter = Router();

contentRouter.post('', userMiddleware, async (req, res) => {

    try {
        const userId = (req as AuthRequest).userId;
        const { type, link, title, tags } = req.body;
        const tagArray = Array.isArray(tags) ? tags : [];
        const existingTags = await TagModel.find({ title: { $in: tagArray } });

        const existingTagTitles = new Set(existingTags.map(tag => tag.title));
        const missingTags = tagArray.filter((tag:any)=> !existingTagTitles.has(tag));

        let newTags: any = [];
        if (missingTags.length > 0) {
            newTags = await TagModel.insertMany(missingTags.map((title: any) => ({ title })));
        }

        const tagIds = [...existingTags, ...newTags].map(tag => tag._id);

        const newContent = await ContentModel.create({ type, link, title, tags: tagIds, userId });

        await newContent.populate("tags", "title");

        res.status(200).json({ message: "Content added successfully", content: newContent });
    } catch (err) {
        res.status(500).json({ Error: err });
    }
});


contentRouter.get('', userMiddleware, async (req, res) => {
    try {
        const userId = (req as AuthRequest).userId;
        const contents = await ContentModel.find({ userId }).populate("userId","username").populate("tags","title");
        
        res.status(200).json({ contents: contents });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
})

contentRouter.delete('', userMiddleware, async (req,res)=> {
    try{
        const { userId } = (req as AuthRequest);
        const { contentId } = req.body;
        const deletedContent = await ContentModel.deleteOne({_id:contentId,userId:userId});
        console.log(deletedContent);
        if (!deletedContent) {
            res.status(403).json({ message: "Content not found or unauthorized" });
            return;
        }
        res.status(200).json({message:"Content Deleted Successfully"});
    }
    catch(err){
        res.status(500).json({ error: err });
    }
})