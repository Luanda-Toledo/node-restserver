const jwt = require('jsonwebtoken');

//=====================
//  Verificar Token
//=====================

let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => { //decoded contiene la info del usuario que se va a mostrar

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        //Solo si pasa por el verificaToken y es correcto se mostrara la info del usuario.
        req.usuario = decoded.usuario;
        next();

    });
};

//====================
// Verifica AdminRole
//====================

let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {

        next();

    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }

};

//============================
// Verifica token para la img
//============================

let VerificaTokenImg = (req, res, next) => {

    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        //Solo si pasa por el verificaTokenImg y es correcto se mostrara la img.
        req.usuario = decoded.usuario;
        next();

    });

};

module.exports = {
    verificaToken,
    verificaAdmin_Role,
    VerificaTokenImg
}