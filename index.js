const express = require('express'); 
const app = express();
const PORT = 8000;
const db = require('./Config/db');

const router = require("./Routes/basicRouting");
const userRouter = require("./Routes/userRoutes");


// const db = mongoose.connection.useDb('test');

app.use(express.json());
app.use("/api", router);
app.use("/userlist",userRouter);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});