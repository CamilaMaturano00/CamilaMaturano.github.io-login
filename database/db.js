const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'camila',
    password: 'maturano',
    database: 'login_node_curso'
});

connection.connect((err) => {
    if(err) throw err
    console.log('La conexión funciona')
});
module.exports = connection;
