const User = require("../Models/User")

exports.viewUsers = async (req,res)=>{  //this exports do the same thing as module.exports
    const result = await User.find();
    if(result){
        res.send({
            "Message":`${result.length} Users found`,
            "Users list":result
        }).status(200);
    }else{
        res.send({
            "Message":"No users found"
        }).status(404);
    }
};

exports.viewUser = async (req,res)=>{
    const id = req.params.id;
    const result = await User.find({_id:id});
    if(result){
        res.send({
            "Message":`User found`,
            "User":result
        }).status(200);
    }else{
        res.send({
            "Message":"User not found"
        }).status(404);
    }
};

exports.addUser = async (req, res) => {
    try {
      const { firstName, lastName, username, email, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password : hashedPassword
      });
  
      await newUser.save();
  
      res.status(201).json({
        message: "User created successfully",
        user: newUser
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  exports.updateProfile = async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body; // expects nickname, gender, country, timezone, vehicleNo
  
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true } //get the updated user to the variable, if not old user is recieved
      );
   
      if (updatedUser) {
        res.status(200).json({
          message: "Profile updated successfully",
          user: updatedUser
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
  
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };