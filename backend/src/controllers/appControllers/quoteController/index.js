const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Quote');

const sendMail = require('./sendMail');
const create = require('./create');
const update = require('./update');
const read = require('./read');
const convert = require('./convert');

methods.mail = sendMail;
methods.create = create;
methods.update = update;
methods.read = read;
methods.convert = convert;

module.exports = methods;
