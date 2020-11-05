const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const userSchema = new Schema({
  name: String,
	desc: String,
	file_name: String,
	img:
	{
		data: Buffer,
		contentType: String
	},
  email: String,
  username: String,
  password: String,
  secretToken: String,
  active: Boolean
},{
  timestamps: {
    createdAt: 'createdAt',
    updateAt: 'updateAt'
  }
});

const User = mongoose.model('user', userSchema);
module.exports = User;
module.exports.hashPassword = async(password) => {
  try{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password,salt);
  }catch(error){
    throw new Error('Hashing Failed',error);
  }
};
module.exports.comparePasswords = async (inputPassword, hashPassword) => {
  try {
    return await bcrypt.compare(inputPassword,hashPassword);
  }catch(error){
    throw new Error('Comparing Field', error);
  }
}
