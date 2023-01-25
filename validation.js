const Joi = require('@hapi/joi');

//Register Validation
const registerValidation = data => {
    const schema = Joi.object ({
        user: Joi.string().min(6).required(),
        Email: Joi.string().min(6).required().email(),
        pass: Joi.string().min(6).required()
    });

    return schema.validate(data)
};

const loginValidation = data => {
    const schema = Joi.object ({
        Email: Joi.string().min(6).required().email(),
        pass: Joi.string().min(6).required()
    });

    return schema.validate(data)
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;