//1-Invocamos a express
const express= require('express');
const app = express();
//2-Seteamos urlencoded capturar datos y trabajar con formato JSON
app.use(express.urlencoded({extended:false})); 
app.use(express.json());
//3-directorio public
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'))
//4-Establecemos el motor de plantillas ejs
app.set('view engine','ejs');
//5-Invocamos a bcryptjs 
const bcryptjs = require ('bcryptjs');
//6-Variables de sesion
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
//7-Invocamos el modulo de conexion de la base de datos
const connection = require('./database/db');
//8-Estableciendo las rutas

app.get('/login',(req,res)=>{
    res.render('login'); //Enviar variables
})
app.get('/register',(req,res)=>{
    res.render('register'); //Enviar variables
})
//9-Registración
app.post('/register',async (req,res)=>{
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    let passwordHaash = await bcryptjs.hash(req.body.pass,2);
    connection.query('INSERT INTO users SET ?', {user:user , name:name , rol:rol , pass: passwordHaash}, async (error,results) =>{
        if(error){
            res.render('register',{
                alert: true,
                alertTitle: "Error",
                alertMessage: "Nombre de usuario no disponible!",
                alertIcon: "error",
                showConfirmButton: false,
                timer: 1500,
                ruta:'register'})
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registration",
                alertMessage: "Successful Registration!",
                alertIcon: "success",
                showConfirmButton: false,
                timer: 1500,
                ruta:''
            })
        }
    })
});

//10 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcryptjs.hash(pass, 2);
	if (user && pass) {
		connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });		
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});    
			}			
			res.end();
		});
	} else {	
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingrese un usuario y/o contraseña!",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta:'login'
        })
	}	
});

//11 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});
//12-LOGOUT
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.listen(3000,(req,res) =>{
    console.log('SERVER RUNNING IN http://localhost:3000');
})
