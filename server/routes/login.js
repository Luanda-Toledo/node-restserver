const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');



app.post('/login', (req, res) => {

    //Entiendase como body el email y el password.
    let body = req.body;

    //Aqui buscamos y creamos la primera condicion.(El email que ingrese el usuario debe ser igual al registrado en la db)
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos' //el usuario esta entre () para indicar que el error es que no se encontro en DB. NO HACER ESTO EN PRODUCCION.
                }
            });
        }

        //El bcrypt nos va a regresar un true o false, para identificar si coincide con la registrada en la DB.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos' //En este caso valida la contraseña. NO HACER EN PRODUCCION ().
                }
            });
        }

        //Configuraciones del token en config.js
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });


});

module.exports = app;