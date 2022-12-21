
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/todolist.db', sqlite3.OPEN_READWRITE, (err) => {
if (err) {
    console.error(err.message);
}
console.log('Connected to the todolist  db.');
});


const GetUserFromEmail = () => {
    console.log('GETUSERFORMEMAIL ' + email);
  };

function GetUserFromEmail(email)
{
    console.log('GETUSERFORMEMAIL ' + email);AAAA
}

module.exports = db;
exports.GetUserFromEmail = GetUserFromEmail;