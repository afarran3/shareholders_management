// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt
var projects = [];
frappe.ui.form.on('Shareholder Account', {
  refresh: function(frm) {
    if(!frm.doc.is_company){
      frm.set_query('project', 'withdrawal_operations', function(doc, cdt, cdn) {
        return {
          query: "shareholders_management.shareholders.doctype.shareholder_account.shareholder_account.get_shareholder_projects",
          filters: {
            'shareholder_name': frm.doc.shareholder_name,
            "currency": frm.doc.currency
          }
        }
      });

      frm.set_query('project', 'deposit_operations', function(doc, cdt, cdn) {
        return {
          query: "shareholders_management.shareholders.doctype.shareholder_account.shareholder_account.get_shareholder_projects",
          filters: {
            'shareholder_name': frm.doc.shareholder_name,
            "currency": frm.doc.currency
          }
        }
      });
    }
    else {
      frm.set_query('project', 'withdrawal_operations', function(doc, cdt, cdn) {
        return {
          query: "shareholders_management.shareholders.doctype.shareholder_account.shareholder_account.get_company_projects",
          filters: {
            'company_name': frm.doc.shareholder_name,
            "currency": frm.doc.currency
          }
        }
      });

      frm.set_query('project', 'deposit_operations', function(doc, cdt, cdn) {
        return {
          query: "shareholders_management.shareholders.doctype.shareholder_account.shareholder_account.get_company_projects",
          filters: {
            'company_name': frm.doc.shareholder_name,
            "currency": frm.doc.currency
          }
        }
      });
    }
  },
  setup: function(frm) {

  },

  get_available_balance: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    var total_deposits = 0;
    var total_withdrawals = 0;
    for (var i = 0; i < frm.doc.deposit_operations.length; i++) {
      total_deposits += frm.doc.deposit_operations[i].amount;
    }
    if(frm.doc.withdrawal_operations != undefined){
      for (var i = 0; i < frm.doc.withdrawal_operations.length; i++) {
          total_withdrawals += frm.doc.withdrawal_operations[i].amount;
        }
    }
    else{
      total_withdrawals = 0;
    }
    frm.doc.available_balance = total_deposits - total_withdrawals;
    frm.refresh_fields("available_balance");
    if (frm.doc.available_balance < 0){
      var withdrawal_amount = row.amount;
      var available_balance = frm.doc.available_balance
      frm.doc.available_balance = available_balance + withdrawal_amount;
      frm.refresh_fields("available_balance");
      frappe.model.set_value(cdt, cdn, "amount", 0);
      var tbl = frm.doc.withdrawal_operations || [];
      frm.events.remove_row(frm, tbl, "withdrawal_operations");
      frappe.throw(__("You have exceeded the available balance, you can't withdraw more than {0} !!",
      [available_balance + withdrawal_amount]))
    }
  },

  remove_row: (frm, tbl, ctn) => {
    var i = tbl.length;
    while (i--)
    {
        if(tbl[i].amount == 0)
        {
            frm.get_field(ctn).grid.grid_rows[i].remove();
        }
    }
    frm.refresh();
  },

  get_shareholding_amount: (frm, cdt, cdn, project, shareholder_name) => {
    frappe.xcall('shareholders_management.shareholders.doctype.shareholder_account.shareholder_account.get_shareholding_amount', {
        "project": project,
        "shareholder_name": shareholder_name
      }).then( r => {
        console.log(r);
        var child = locals[cdt][cdn];
        frappe.model.set_value(cdt, cdn, 'amount', r);
      });
  }
});

frappe.ui.form.on("Withdrawal", {
  withdrawal_operations_remove: function(frm, cdt, cdn) {
    frm.events.get_available_balance(frm, cdt, cdn);
  },

  amount: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if (row.amount != 0){
      frm.events.get_available_balance(frm, cdt, cdn);
    }
  },

  project: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if(row.project){
      frm.events.get_shareholding_amount(frm, cdt, cdn, row.project, frm.doc.shareholder_name);
    }
  },

  withdrawal_date: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if (row.withdrawal_date > frappe.datetime.get_today()){
      var date = row.withdrawal_date;
      frappe.model.set_value(cdt, cdn, "withdrawal_date", undefined);
      frappe.throw(__("This date {0} has not come yet !!",[date.bold()]))
    }
  },

  withdrawal_type: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if (row.withdrawal_type != "Shareholding"){
      frappe.model.set_value(cdt, cdn, "project", undefined);
      frappe.model.set_value(cdt, cdn, "amount", 0);
    }
  },
});

frappe.ui.form.on("Deposit", {
  deposit_operations_remove: function(frm, cdt, cdn) {
    frm.events.get_available_balance(frm, cdt, cdn);
  },

  deposit_date: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if (row.deposit_date > frappe.datetime.get_today()){
      var date = row.deposit_date;
      frappe.model.set_value(cdt, cdn, "deposit_date", undefined);
      frappe.throw(__("This date {0} has not come yet !!",[date.bold()]))
    }
  },

  amount: (frm, cdt, cdn) => {
    var row = frm.selected_doc;
    if (row.amount != 0){
      frm.events.get_available_balance(frm, cdt, cdn);
    }
  },
});
