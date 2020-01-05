//==============
//   Puerto
//==============

process.env.PORT = process.env.PORT || 3000;

//==============
//   Entorno
//==============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===============
// Base de Datos
//===============

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://Admin:wRLHedHg9f0FrB1z@cluster0-e1jff.mongodb.net/cafe';
}

process.env.URLDB = urlDB;