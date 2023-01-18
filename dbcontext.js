
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto'); 

let db = new sqlite3.Database('./db/todolist.db', sqlite3.OPEN_READWRITE, (err) => {
if (err) {
    console.error(err.message);
}
console.log('Connected to the todolist  db.');
});

// THIS ENTITY USED TO CREATE A LOGGEDUSER ENTITY
let LoggedUser =class {
    constructor(id,username, email,password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }
    getId() {
        return this.id;
    }
    getUsername() {
        return this.username;
    }
    getEmail() {
        return this.email;
    }
    getPassword() {
        return this.password;
    }
}
 
// THIS FUNCTION CHECK IF EMAIL EXIST INTO DB THEN RETURN NULL
// IF EMAIL EXIST CHECK INPUT HASHED PASSWORD WITH STORED PASSWORD FOR THIS EMAIL
// IF PASSWORD IS CORRECT RETURN ROW FOR FILL LOGGEDUSER ENTITY ELSE RETURN NULL
async function doAuthenticate(email,password){
    return new Promise(function(resolve,reject){
        var loggeduser;
        db.get('SELECT Password FROM TB_Users WHERE Email = ?', email, async function(err, row1) {
            if(err){return reject(err);}
         
            if (!row1){
             //console.log("user not found");
             loggeduser= null ;
           } 
           //console.log("Password letta a db="+ row1.Password);
           var hash = await hashPassword(password);
       
           //console.log("Password inserita hashata="+ hash);
           
           db.get('SELECT UserName,Email, ID, Password FROM TB_Users WHERE Email = ? AND Password = ?', email, hash,  function(err, row) {
                if(err){return reject(err);}
                
                resolve(row);
           
       
           });
         });
    });
}

// THIS FUNCTION CHECK IF IN DB EXIST USER WITH THE SAME EMAIL THEN RETURN FALSE
// IF EMAIL DON'T EXIST USER WILL STORED INTO DB RETURN TRUE
async function doRegister(username,email,password){
    return new Promise(function(resolve,reject){
        var loggeduser;
        db.get('SELECT ID FROM TB_Users WHERE Email = ?', email, async function(err, row1) {
            if(err){return reject(err);}
         
            if (!row1){ // se non esiste utente con quella email procedo con inserimento
                
                var hash = await hashPassword(password);
            
               
                
                db.run('INSERT INTO TB_Users(UserName,Email,Password ) VALUES(?,?,?) ', username,email, hash,  function(err, row) {
                        if(err){return reject(err);}
                        
                        resolve(true);
                
            
                });
             
            } 
            else
                resolve(false);
           
         });
    });
}

async function doAuthenticate(email,password){
    return new Promise(function(resolve,reject){
        var loggeduser;
        db.get('SELECT Password FROM TB_Users WHERE Email = ?', email, async function(err, row1) {
            if(err){return reject(err);}
         
            if (!row1){
             //console.log("user not found");
             loggeduser= null ;
           } 
           //console.log("Password letta a db="+ row1.Password);
           var hash = await hashPassword(password);
       
           //console.log("Password inserita hashata="+ hash);
           
           db.get('SELECT UserName,Email, ID, Password FROM TB_Users WHERE Email = ? AND Password = ?', email, hash,  function(err, row) {
                if(err){return reject(err);}
                
                resolve(row);
           
       
           });
         });
    });
}

// THIS FUNCTION GET LISTS STORED FOR THIS USER
async function GetUserLists(iduser){
    return new Promise(function(resolve,reject){
        let sql = 'SELECT * FROM Tb_ToDoLists WHERE IdUser = ' + iduser + ' order by Timestamp DESC ';
        db.all(sql,[], async function(err, rows) {
            if(err){return console.log(err); reject(err);}
            //console.log(rows);
            // rows.forEach((row) => {
            //     console.log(row.Nome);
            //   });
            resolve(rows);
           
           
         });
    });
}

// THIS FUNCTION CREATE A NEW USER LIST
async function InsertUserList(description,iduser){
    return new Promise(function(resolve,reject){
        let sql = 'INSERT INTO  Tb_ToDoLists (Nome,IdUser) VALUES (?,?)' ;
        db.run(sql,[description,iduser], async function(err, rows) {
            if(err)
            {
                return console.log(err); 
                reject(err);
            }
            else
                resolve(true);
           
           
         });
    });
}

// THIS FUNCTION CREATE A NEW USER LIST
async function DeleteUserList (iditem){
    return new Promise(function(resolve,reject){
        let sql = 'DELETE From Tb_ToDoLists WHERE Id =?' ;
        db.run(sql,[iditem], async function(err, rows) {
            if(err)
            {
                return console.log(err); 
                reject(err);
            }
            else
                resolve(true);
           
           
         });
    });
}

// THIS FUNCTION HASH PASSWORD TO STORE INTO DB
async function hashPassword(password) {
    var hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}

// EXPORT TO SHARED FUNCTION IN SERVER.JS
module.exports = db;
module.exports = LoggedUser;
module.exports.doAuthenticate = doAuthenticate;
module.exports.doRegister = doRegister;
module.exports.GetUserLists = GetUserLists;
module.exports.InsertUserList = InsertUserList;
module.exports.DeleteUserList = DeleteUserList;



