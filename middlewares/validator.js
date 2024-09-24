const joi = require('@hapi/joi');

const validateUser = (data) => {
    try {
        const validateSchema = joi.object({
            tradeRole: joi.string().min(4).max(6).valid("buyer", "seller", "both").trim().messages({
                'string.empty': "Trade Role field can't be left empty",
                'string.min': "Minimum of 3 characters for the Trade Role field",
                'string.max': "Maximum of 6 characters long for the Trade Role field",
                'any.required': "Please Trade Role is required"
            }),
            state: joi.string().min(4).valid("Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi",
                "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
                "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara").trim().messages({
                    'string.empty': "State field can't be left empty",
                    'string.min': "Minimum of 3 characters for the State field",
                    'any.required': "Please State is required"
                }),
            email: joi.string().max(50).trim().email({ tlds: { allow: false } }).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
            confirmPassword: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).valid(joi.ref('password')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required",
                'any.only': 'Passwords do not match',
            }),
            company: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_\-!@#$%^&*()]*$/).trim().messages({
                'string.empty': "Company field can't be left empty",
                'string.min': "Minimum of 3 characters for the Company field",
                'string.max': "Maximum of 30 characters long for the Company field",
                "string.pattern.base": "Please enter a valid Company",
                'any.required': "Please Company is required"
            }),
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
            }),
            tel: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).messages({
                'string.empty': "Tel field can't be left empty",
                'string.min': "Tel must be atleast 11 digit long e.g: 08123456789",
                'string.pattern.base': "Tel must be atleast 10 digit long e.g: 8123456789",
                'any.required': "Please Tel is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateUserLogin = (data) => {
    try {
        const validateSchema = joi.object({
            email: joi.string().max(50).trim().email({ tlds: { allow: false } }).messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateResetPassword = (data) => {
    try {
        const validateSchema = joi.object({
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
            confirmPassword: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).valid(joi.ref('password')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required",
                'any.only': 'Passwords do not match',
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}

const validateMessage = (data) => {
    try {
        const validateSchema = joi.object({
            Account: joi.string().min(3).regex(/^[a-zA-Z]+$/).valid("Finding", "Products/Suppliers", "Messenger", "Order", "Checkout", "Return and Refund", "Others", "Logistics").trim().required().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
                'any.required': "Please first name is required",
                "string.pattern.base": "Please no space is allowed/No special characters allowed"
            }),
            selectAreason: joi.string().min(3).regex(/^[a-zA-Z]+$/).valid("Verification code expired", "Didn't receive verification code", "Number of verification codes sent has exceeded the daily limit", "Unable to change email address", "Password retrieval failed", "Unable to login the current account", "Account registration failed", "Others").trim().required().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
                'any.required': "Please last name is required"
            }),
            writeMore: joi.string().min(3).trim().required().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
                'any.required': "Please last name is required"
            }),
            email: joi.string().max(40).trim().email({ tlds: { allow: false } }).messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



const validateUserPersonalProfile = (data) => {
    try {
        const validateSchema = joi.object({
            tradeRole: joi.string().min(4).max(6).valid("buyer", "seller", "both").trim().messages({
                'string.empty': "Trade Role field can't be left empty",
                'string.min': "Minimum of 3 characters for the Trade Role field",
                'string.max': "Maximum of 6 characters long for the Trade Role field",
                'any.required': "Please Trade Role is required"
            }),
            state: joi.string().min(4).valid("Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi",
                "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun",
                "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara").trim().messages({
                    'string.empty': "State field can't be left empty",
                    'string.min': "Minimum of 3 characters for the State field",
                    'any.required': "Please State is required"
                }),
            email: joi.string().max(50).trim().email({ tlds: { allow: false } }).required().messages({
                'string.empty': "Email field can't be left empty",
                'any.required': "Please Email is required"
            }),
            password: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required"
            }),
            confirmPassword: joi.string().min(8).max(20).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).valid(joi.ref('password')).trim().required().messages({
                'string.empty': "Password field can't be left empty",
                'string.pattern.base': 'Password must contain Lowercase, Uppercase, Numbers, and special characters',
                'string.min': "Password must be at least 8 characters long",
                'any.required': "Please password field is required",
                'any.only': 'Passwords do not match',
            }),
            company: joi.string().min(3).max(30).regex(/^[a-zA-Z0-9\s_\-!@#$%^&*()]*$/).trim().messages({
                'string.empty': "Company field can't be left empty",
                'string.min': "Minimum of 3 characters for the Company field",
                'string.max': "Maximum of 30 characters long for the Company field",
                "string.pattern.base": "Please enter a valid Company",
                'any.required': "Please Company is required"
            }),
            firstName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "First name field can't be left empty",
                'string.min': "Minimum of 3 characters for the first name field",
            }),
            lastName: joi.string().min(3).max(30).regex(/^[a-zA-Z]+$/).trim().messages({
                'string.empty': "Last name field can't be left empty",
                'string.min': "Minimum of 3 characters for the last name field",
            }),
            tel: joi.string().min(11).max(11).trim().regex(/^0\d{10}$/).messages({
                'string.empty': "Tel field can't be left empty",
                'string.min': "Tel must be atleast 11 digit long e.g: 08123456789",
                'string.pattern.base': "Tel must be atleast 10 digit long e.g: 8123456789",
                'any.required': "Please Tel is required"
            }),
        })
        return validateSchema.validate(data);
    } catch (error) {
        throw error
    }
}



module.exports = {
    validateUser,
    validateUserLogin,
    validateResetPassword,
    validateMessage, 
    validateUserPersonalProfile,

}