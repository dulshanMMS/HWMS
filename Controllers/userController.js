import bcrypt from "bcryptjs";
import User from "../Models/User.js";

export const viewUsers = async (req, res) => {
  const result = await User.find();
  if (result) {
    res.status(200).send({
      Message: `${result.length} Users found`,
      "Users list": result,
    });
  } else {
    res.status(404).send({
      Message: "No users found",
    });
  }
};

export const viewUser = async (req, res) => {
  const id = req.params.id;
  const result = await User.find({ _id: id });
  if (result) {
    res.status(200).send({
      Message: `User found`,
      User: result,
    });
  } else {
    res.status(404).send({
      Message: "User not found",
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (updatedUser) {
      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
