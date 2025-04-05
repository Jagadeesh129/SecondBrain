import { UserModel } from "../schema";
import bcrypt from "bcrypt";
import { userMiddleware } from "../middlewares/user";
import { AuthRequest } from "../middlewares/user";
import jwt from "jsonwebtoken";
import {Router} from "express";
import z from "zod";

export const userRouter = Router();
const SECRETKEY = process.env.JWT_SECRET;

userRouter.post('/signup', async (req, res) => {
    try {
    // Input validation
    const requiredBody = z.object({
        username: z.string().min(3,"Minimum length is 3"),
        password: z.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
        name: z.string().min(2)
    })

    // parse the body
    const parseData = requiredBody.safeParse(req.body);
    if(!parseData.success){
        res.status(411).json({message:"Invalid input", error: parseData.error.issues})
    }

    // validation is done, now proceed
    const { username, name, password } = req.body;
    
        const existedUser = await UserModel.findOne({ username: username });
        console.log(existedUser);
        if (existedUser!=null) {
            res.status(403).json({ message: "User already exists" });
            return;
        }
        const hashPassword = await bcrypt.hash(password,10);
        const newUser = await UserModel.create({ name, username, password:hashPassword });
        console.log(newUser);
        res.status(200).json({ message: "User added sucessful" });
    }
    catch (err) {
        res.status(500).send({ "message": err });
    }
})

userRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try{
        const existedUser = await UserModel.findOne({username:username});
        console.log(existedUser);
        if(!existedUser){
            res.status(403).json({"message":"Incorrect username or Password"});
            return
        }
        const isCorrectPassword = await bcrypt.compare(password,existedUser.password);
        if(!isCorrectPassword || !SECRETKEY){
            res.status(403).json({"message":"Incorrect username or Password"});
            return
        }
        const token = jwt.sign({id:existedUser._id}, SECRETKEY);
        res.status(200).json({"token":token});
    }
    catch(err){
        res.status(500).send({ "message": err });
    }
})

userRouter.delete('/delete', userMiddleware, async (req, res) => {
    const userId  = (req as AuthRequest).userId;
    try {
        const deleteUser = await UserModel.deleteOne({ _id: userId });
        console.log(deleteUser);
        res.status(200).json({ message: "User deleted succefully" });
    }
    catch (err) {
        res.status(500).json({ message: err })
    }
})