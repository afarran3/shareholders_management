// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt

frappe.ui.form.on('Project Settings', {
	// refresh: function(frm) {

	// }
  setup: function(frm) {
    frm.set_query('currency', 'stock_values', function(doc, cdt, cdn) {
      var currency_array = [];
      for (var i = 0; i < frm.doc.stock_values.length; i++) {
        currency_array.push(frm.doc.stock_values[i].currency);
      }
      return {
        filters: {
          "name": ["not in", currency_array]
        }
      }
    });
  },
});
