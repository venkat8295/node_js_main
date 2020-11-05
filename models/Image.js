var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
	name: String,
	desc: String,
	file_name: String,
	username:String,
	email:String,
	img:
	{
		data: Buffer,
		contentType: String
	},
	comments:[String]
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);
