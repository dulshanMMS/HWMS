import bcrypt from "bcryptjs";

const hashPassword = async (plainTextPassword) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
  console.log("Hashed Password:", hashedPassword);
};

hashPassword("Wiley#123");
