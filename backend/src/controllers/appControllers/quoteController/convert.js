const mongoose = require('mongoose');

const Quote = mongoose.model('Quote');
const Invoice = mongoose.model('Invoice');
const { increaseBySettingKey } = require('@/middlewares/settings');

const convert = async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, removed: false }).lean();

  if (!quote) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Quote not found',
    });
  }

  const invoiceData = {
    createdBy: req.admin._id,
    number: quote.number,
    year: quote.year,
    content: quote.content,
    date: quote.date,
    expiredDate: quote.expiredDate,
    client: quote.client?._id || quote.client,
    converted: {
      from: 'quote',
      quote: quote._id,
    },
    items: quote.items,
    taxRate: quote.taxRate,
    subTotal: quote.subTotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    currency: quote.currency,
    credit: 0,
    discount: quote.discount || 0,
    paymentStatus: quote.total - (quote.discount || 0) === 0 ? 'paid' : 'unpaid',
    status: 'draft',
    notes: quote.notes,
  };

  const invoice = await new Invoice(invoiceData).save();
  const updateInvoice = await Invoice.findOneAndUpdate(
    { _id: invoice._id },
    { pdf: 'invoice-' + invoice._id + '.pdf' },
    { new: true }
  ).exec();

  await Quote.findOneAndUpdate({ _id: quote._id }, { converted: true }).exec();

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  return res.status(200).json({
    success: true,
    result: updateInvoice,
    message: 'Quote converted to invoice successfully',
  });
};

module.exports = convert;
