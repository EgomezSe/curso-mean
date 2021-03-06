
'user strict'
var bcrypt= require('bcrypt-nodejs');
var User=require('../models/User');
var jwt = require('../services/jwt');  

function pruebas(req,res){
	res.status(200).send({
		message: 'probando una accion del controlador de usuarios con api rest con Node y Mongo'
	});
}

function saveUser(req,res){

	var user=new User();

	var params = req.body;

	console.log(params);

	user.name=params.name;
	user.surname= params.surname;
	user.email =params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if(params.password != null){

		//encriptar contraseña y guardar datos
		bcrypt.hash(params.password,null,null, function(err,hash){
			user.password = hash;
			if (user.name != null && user.surname != null && user.email != null) {
				//guardar usuario
				user.save((err,userStored) => {
					if(err){

						res.status(500).send({message: 'error al guardar el usuario'});

					}else{
						if(!userStored){
							res.status(404).send({message: 'No se ha registrado el usuario'});
						}else{
							res.status(200).send({user: userStored});
						}

					}
				});
			}else{
					res.status(200).send({message: 'Rellena todos los campos'});
			}
		});
	}
	else{
		res.status(200).send({message: 'introduce la contraseña'});
	}
}

function loginUser(req,res){

	var params= req.body;
	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err,user)=> {
		if(err){
			res.status(500).send({message: 'error en la petición'});
		}
		else{
			if(!user){
				res.status(404).send({message:'el usuario no existe'});

			}
			else{
				//comparar contraseña
				bcrypt.compare(password,user.password,function(err,check){
					if(check){
						//devolver datos de usuario logueado
						if(params.gethash){
							//devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user});
						}
					}
					else{
						res.status(404).send({message:'El usuario no ha podido loguearse'});
					}
				});
			}
		}
	});
}

	module.exports = {
		pruebas,
		saveUser,
		loginUser
	};
