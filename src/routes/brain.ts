import { Router } from "express";
import { AuthRequest, userMiddleware } from "../middlewares/user";
import { ContentModel, LinkModel, UserModel } from "../schema";

export const brainRouter = Router();

brainRouter.post('/share', userMiddleware, async (req, res) => {
    const { userId } = (req as AuthRequest);
    const { share } = req.body;
    // console.log(share);
    try {
        if (share) {
            const existedLink = await LinkModel.findOne({ userId: userId });
            if (existedLink) {
                res.status(200).json({ hash: existedLink.hash });
                return;
            }
            // console.log(existedLink);
            const hash = random(10);
            // console.log(hash);
            // console.log(userId);
            const link = await LinkModel.create({userId: userId, hash: hash});
            // console.log(link);
            res.status(200).json({ hash: hash });
            return;
        }
        else {
            await LinkModel.deleteOne({ userId });
            res.json({ message: "Removed link" });
            return;
        }
    }
    catch (err) {
        res.status(500).json({ err });
    }

})

brainRouter.get('/:shareLink', async (req, res) => {
    try {
        const hash = req.params.shareLink;
        const link = await LinkModel.findOne({ hash });
        if (!link) {
            res.status(400).json({ "Error": "Incorect link or it may be expired" });
            return;
        }
        const user = await UserModel.findOne({ _id: link.userId });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        const contents = await ContentModel.find({ userId: link.userId });
        res.status(200).json({ contents, username: user.username });
    }
    catch(err){
        res.status(500).json({err});
    }
})

function random(len: number) {
    let options = "qwertyuioasdfghjklzxcvbnm12345678";
    let length = options.length;

    let ans = "";

    for (let i = 0; i < len; i++) {
        ans += options[Math.floor((Math.random() * length))] // 0 => 20
    }

    return ans;
}