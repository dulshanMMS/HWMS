import express from "express"; 
const app = express();
const PORT = 8000;
import db from "./Config/db.js";

import router from "./Routes/basicRouting.js";
import userRouter from "./Routes/userRoutes.js";


// const db = mongoose.connection.useDb('test');

app.use(express.json());
app.use("/api", router);
app.use("/userlist",userRouter);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});