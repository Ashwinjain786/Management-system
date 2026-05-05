const mongoose = require('mongoose');

const Model = mongoose.model('Quote');

const { calculate } = require('@/helpers');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  let body = req.body;

  const { error } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0 } = req.body;

  if (items.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Items cannot be empty',
    });
  }

  let subTotal = 0;
  items.map((item) => {
    const total = calculate.multiply(item.quantity, item.price);
    subTotal = calculate.add(subTotal, total);
    item.total = total;
  });

  const taxTotal = calculate.multiply(subTotal, taxRate / 100);
  const total = calculate.add(subTotal, taxTotal);

  body = {
    ...body,
    subTotal,
    taxTotal,
    total,
    items,
    pdf: 'quote-' + req.params.id + '.pdf',
  };

  if (body.hasOwnProperty('currency')) {
    delete body.currency;
  }

  const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
    new: true,
  }).exec();

  return res.status(200).json({
    success: true,
    result,
    message: 'we update this document ',
  });
};

module.exports = update;
