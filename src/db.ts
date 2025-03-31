import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URI as string;
const setConnection = async():Promise<void>=>{
    return await mongoose.connect(url)
    .then(
        () => {
            console.log("Mongo DB Connected Succfully");
        }
    )
    .catch(err => { console.log(err.reason) });
}

export default setConnection;