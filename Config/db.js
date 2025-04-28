const mongoose = require('mongoose');
const URI = "mongodb+srv://hwmsbooking:f0yWeabr2yB7sfyJ@cluster0.otoqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

try{
    mongoose.connect(URI);
    console.log('Connected to the cluster');
}catch(err){
    console.log(err);
}
