const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {

    //En caso de que el usuario no nos especifique el numero, suponemos que quiere verlos desde el numero 0.
    let desde = req.query.desde || 0;
    desde = Number(desde); //Esto lo transforma de string a un numero.

    //De esta manera el usuario puede especificar cuantos registros quiere por pag.
    let limite = req.query.limite || 5;
    limite = Number(limite);

    //Dentro de find podemos especificar que caracteristicas deben tener los usuarios por ejemplos para traerlos y luego mostrarlos.
    //En este caso le estamos pidiendo que nos traiga todos los registros de esa coleccion.
    Usuario.find({ estado: true }, 'nombre email role estado google img') //dentro de '' especificamos la info que se va a mostrar, y excluir lo que necesitemos.
        .skip(desde) //.skip(5) => ej : Especificamos que se salte los primero 5 registros, y muestre los que le siguen.
        .limit(limite) //.limit(5) => ej: Especificamos la cantidad de registro que nos va traer.
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Podemos contar los registros y enviarle la cantidad de registros de usuarios existentes.
            Usuario.count({ estado: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });

        });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Nos sirve para no mostrar la contraseña como resultado sino que muestra valor null. 
        //usuarioDB.password = null;

        //Para mas seguridad, directamente no mostramos ni el password ni el resultado. Ocultamos todo. 
        //(en models/usuario.js)

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

//Por put se entiende la actualizacion de un registro.
//En este caso obtendremos el id de un registro y lo usaremos para buscar en la base de datos.
//Y a la vez actualizar el registro que coincida.
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    //Dentro del arreglo colocamos los objetos que si queremos que sean modificados.
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //findByIdAndUpdate = con esta funcion de mongoose le decimos que busque por el id y lo actualice si lo encuentra.
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        //Con el objeto new como tercer parametro le estamos diciendo que el registro se actualize cada vez que sucedan cambios.
        //Con runValidators, nos aseguramos que el campo de roles sea validado correctamente.

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    //Obtenemos el id.
    let id = req.params.id;

    //De esta manera cuando encuentre un registro con el id especificado, lo borrara.
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Si el usuario no existe en la base de datos envia el mensaje.
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    });

});

module.exports = app;