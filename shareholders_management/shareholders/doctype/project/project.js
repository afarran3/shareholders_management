// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt
var label_value = __("Ratio");
frappe.ui.form.on('Project', {
  refresh: function(frm, doc, cdt, cdn) {
    if (frm.is_new() != 1) {
      if (frm.doc.is_amounts_deducted) {
        let meta = frappe.meta.docfield_list["Project Shareholder"];
        for (var i = 0; i < meta.length; i++) {
          if (meta[i].fieldname != "description") {
            var df = frappe.meta.get_docfield("Project Shareholder", meta[i].fieldname, frm.doc.name);
            df.read_only = 1;
          }
        }
      }
      if (!frm.doc.is_amounts_deducted) {
        frm.add_custom_button(__("Sync accounts"), () => {
          if (frm.doc.total_cost > frm.doc.total_shareholding_amount) {
            frappe.throw(__("Please add other shareholders or increase ratios of the current shareholders' so that the total shareholding amounts equals the total cost of the project !!"))
          } else if (frm.doc.total_cost < frm.doc.total_shareholding_amount) {
            frappe.throw(__("Please delete some shareholders or decrease ratios of the current shareholders' so that the total shareholding amounts equals the total cost of the project !!"))
          } else {
            frappe.confirm(
              __("This will deduct shareholders' amounts from thire accounts, Are you sure !!"),
              function() {
                console.log(frm.doc.project_shareholder);
                if (frm.doc.project_shareholder) {
                  frappe.xcall('shareholders_management.shareholders.doctype.project.project.submit_shareholdedrs_withdrawal', {
                    "project_name": frm.doc.project_name,
                    "start_date": frm.doc.start_date
                  }).then(r => {
                    if (r == 1) {
                      frm.doc.is_amounts_deducted = 1;
                      frappe.show_alert({
                        message: __("Shareholders' accounts have been deducted successfully."),
                        indicator: 'green'
                      });
                      frm.save();
                    } else {
                      frappe.show_alert({
                        message: __("There is no shareholders for this project yet !!"),
                        indicator: 'red'
                      });
                    }
                  });
                }
              },
              function() {
                frappe.show_alert({
                  message: __("You have not deducted the amounts from Shareholders' accounts yet !!"),
                  indicator: 'red'
                });
              })
          }
        });
      }

      if (frm.doc.is_amounts_deducted && !frm.doc.sold) {
        frm.add_custom_button(__("Sale"), () => {
          frappe.prompt([{
              fieldname: "company_ratio",
              fieldtype: "Float",
              label: __("Company Ratio ({0})",[label_value]),
              reqd: 1
            },
            {
              fieldname: "sale_amount",
              fieldtype: "Float",
              label: __("Sale Amount"),
              reqd: 1
            },
            {
              fieldname: "sale_date",
              fieldtype: "Date",
              label: __("Sale Date"),
              reqd: 1
            }
          ], (data) => {
            frm.doc.sold = 1;
            frm.doc.company_ratio = data.company_ratio;
            frm.refresh_fields("company_ratio");
            frm.events.calc_ratio(frm, data.sale_amount, data.company_ratio);
            console.log(data.company_ratio);
            console.log(frm.doc.sold);
            frappe.call({
              method: "shareholders_management.shareholders.doctype.project.project.submit_shareholdedrs_deposit",
              args: {
                project_name: frm.doc.project_name,
                company_name: frm.doc.company_name,
                company_profit: frm.doc.company_profit,
                currency: frm.doc.currency,
                end_date: data.sale_date
              },
              callback: function(r) {
                frappe.call({
                  method: "shareholders_management.shareholders.doctype.project.project.get_doc",
                  args: {
                    doc: doc,
                    name: frm.doc.name
                  },
                  callback: function(r) {
                    frappe.call({
                      "method": "frappe.client.submit",
                      "args": {
                        "doc": r.message
                      },
                      callback: function(r) {
                        frm.save();

                      }
                    })
                  }
                });
              }
            });

          }, __("Sale Informations"));
        });
      }
    }
  },

  calc_ratio: (frm, sale_amount, company_ratio) => {

    var profit = sale_amount - frm.doc.total_cost;
    var stock_number = (frm.doc.total_cost / frm.doc.stock_value) + company_ratio;
    var ps = frm.doc.project_shareholder;
    if (frm.doc.ratio_type == "Stock") {
      for (var i = 0; i < ps.length; i++) {
        ps[i].amount_after_sale = ((profit / stock_number) * ps[i].ratio) + ps[i].amount
      }
      frm.refresh_fields("project_shareholder");
      frm.doc.company_profit = (profit / stock_number) * company_ratio
      frm.refresh_fields("company_profit");
    } else {
      frm.doc.company_profit = ((company_ratio / 100) * profit)
      frm.refresh_fields("company_profit");
      profit = profit - frm.doc.company_profit
      for (var i = 0; i < ps.length; i++) {
        ps[i].amount_after_sale = ((ps[i].ratio / 100) * profit) + ps[i].amount
      }
      frm.refresh_fields("project_shareholder");
    }
  },

  setup: function(frm) {
    frm.set_query('account', 'project_shareholder', function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];
      return {
        filters: {
          "currency": ["=", frm.doc.currency],
          "shareholder_name": ["=", child.shareholder_name],
        }
      }
    });
    frm.set_query('shareholder_name', 'project_shareholder', function(doc, cdt, cdn) {
      var shareholders = [];
      // var child = locals[cdt][cdn];
      for (var i = 0; i < frm.doc.project_shareholder.length; i++) {
        shareholders.push(frm.doc.project_shareholder[i].shareholder_name);
      }
      return {
        filters: {
          "shareholder_name": ["not in", shareholders]
        }
      }
    });
  },
  onload: (frm) => {
    frm.ignore_doctypes_on_cancel_all = ["Project Shareholder"];
    frm.events.ratio_label(frm);
    if(!frm.doc.sold && !frm.is_new()){
      frm.events.get_stock_value(frm);
    }
    frm.events.get_company_name(frm);
  },

  currency: (frm) => {
    if (frm.doc.currency != undefined) {
      frm.events.get_stock_value(frm);
    }
  },

  unit_cost: (frm) => {
    frm.events.set_total_cost(frm)
  },

  number_of_units: (frm) => {
    frm.events.set_total_cost(frm)
  },

  ratio_type: (frm, cdt, cdn) => {
    for (var i = 0; i < frm.doc.project_shareholder.length; i++) {
      var ratio = 0;
      if (frm.doc.ratio_type == "Stock") {
        ratio = frm.doc.project_shareholder[i].amount / frm.doc.stock_value;
      } else {
        ratio = (frm.doc.project_shareholder[i].amount / frm.doc.total_cost) * 100;
      }
      frm.events.ratio_label(frm);
      frm.doc.project_shareholder[i].ratio = ratio
      frm.refresh_fields("project_shareholder");
    }
  },

  validate: (frm, cdt, cdn) => {
    var tbl = frm.doc.project_shareholder || [];
    frm.events.remove_row(frm, tbl, "project_shareholder");
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

  ratio_label: (frm) => {
    if (frm.doc.ratio_type == "Stock") {
      label_value = __("Number of stocks");
    } else {
      label_value = __("Percentage ratio (%)");
    }
  },

  project_shareholder_on_form_rendered: (frm, cdt, cdn) => {
    frm.events.change_ratio_label(frm, cdt, cdn, label_value);
  },

  set_total_cost: (frm) => {
    if (frm.doc.unit_cost && frm.doc.number_of_units) {
      frm.doc.total_cost = frm.doc.unit_cost * frm.doc.number_of_units;
      frm.refresh_fields("total_cost");
    }
  },

  get_stock_value: (frm) => {
    frappe.xcall('shareholders_management.shareholders.doctype.project_settings.project_settings.get_project_settings', {}).then(r => {
      var stock_values = r["stock_values"];
      var found = 0;
      if (stock_values != '') {
        for (var i = 0; i < stock_values.length; i++) {
          if (stock_values[i].currency == frm.doc.currency) {
            found = 1;
            if (frm.doc.stock_value != stock_values[i].value) {
              frm.doc.stock_value = stock_values[i].value;
              frm.refresh_fields("stock_value");
            }
          }
        }
        if (!found) {
          frappe.throw(__("There is no stock value in this currency, to set it go to 'Project Settings' !!"));
        }
      } else {
        frappe.throw(__("Please set a stock values first in 'Project Settings' !!"));
      }
    });
  },

  get_company_name: (frm) => {
    frappe.xcall('shareholders_management.shareholders.doctype.project_settings.project_settings.get_project_settings', {}).then(r => {
      var company_name = r["company_name"];
      if (company_name) {
        if(!frm.doc.sold){
          if (frm.doc.company_name && frm.doc.company_name != company_name) {
            frappe.confirm(
              __("This project company is not the same company in 'Project Settings', do you want to change project company From {0} To {1}",[frm.doc.company_name.bold(), company_name.bold()]),
              function() {
                frm.doc.company_name = company_name;
                frm.refresh_fields("company_name");
                show_alert(__("Project Company changed successfully."))
              },
              function() {
                window.close();
              }
            )
          }
          else if (!frm.doc.company_name) {
            frm.doc.company_name = company_name;
            frm.refresh_fields("company_name");
          }
        }
      } else {
        frappe.throw(__("Please set a company name in 'Project Settings' first !!"));
      }
    });
  },

  get_total_shareholdering_amount: (frm, cdt, cdn) => {
    var total_amount = 0;
    for (var i = 0; i < frm.doc.project_shareholder.length; i++) {
      total_amount = total_amount + frm.doc.project_shareholder[i].amount;
    }
    frm.doc.total_shareholding_amount = total_amount;
    frm.refresh_fields("total_shareholdering_amount");
  },

  change_ratio_label: (frm, cdt, cdn, labelValue) => {
    var label = labelValue.bold();
    frm.events.change_field_label("ratio", label)
    console.log(label);
  },

  change_field_label: function(fieldName, newValue) {
    var mylabel = $("div[data-fieldname=" + fieldName + "]").closest('div').find('label');
    mylabel.html(__(newValue));
  }
});

frappe.ui.form.on("Project Shareholder", {
  project_shareholder_add: function(frm, cdt, cdn) {
    let row = frm.selected_doc;
    frm.cscript.check = function(doc) {
      if (row.shareholder_name != undefined) {
        if (row.account != undefined) {
          frappe.xcall('shareholders_management.shareholders.doctype.project.project.get_shareholder_available_balance', {
            "account": row.account
          }).then(r => {
            var available_balance = r;
            frappe.msgprint(__("{0}'s available balance = {1} {2}.",
              [row.shareholder_name, available_balance, frm.doc.currency]));
          });
        } else {
          frappe.model.set_value(cdt, cdn, "amount", 0);
          frappe.throw(__("Please select an account first !!"))
        }
      } else {
        frappe.model.set_value(cdt, cdn, "amount", 0);
        frappe.throw(__("Please select a shareholder first !!"))
      }
    };
  },

  amount: (frm, cdt, cdn) => {
    let row = frm.selected_doc;
    if (row.shareholder_name != undefined) {
      if (row.account != undefined) {
        if (row.amount != undefined) {
          if (frm.doc.total_cost == 0 || frm.doc.total_cost == undefined) {
            frappe.model.set_value(cdt, cdn, "amount", 0);
            frappe.throw(__("Please insert Unit Type, Unit Cost and Number of Units First !!"))
          } else {
            frappe.xcall('shareholders_management.shareholders.doctype.project.project.get_shareholder_available_balance', {
              "account": row.account
            }).then(r => {
              var available_balance = r;
              if (available_balance < row.amount) {
                var amount = row.amount;
                frappe.model.set_value(cdt, cdn, "amount", 0);
                frappe.throw(__("{0} does not have {1} {2} in his account !! his available balance = {3} {4}.",
                  [row.shareholder_name, amount, frm.doc.currency, available_balance, frm.doc.currency]));
              } else {
                var ratio = 0
                if (frm.doc.ratio_type == "Stock") {
                  ratio = row.amount / frm.doc.stock_value;
                } else {
                  ratio = (row.amount / frm.doc.total_cost) * 100;
                }
                frappe.model.set_value(cdt, cdn, "ratio", ratio);
                frm.events.get_total_shareholdering_amount(frm, cdt, cdn);
              }
            });
          }
        }
      } else if (row.amount != 0) {
        frappe.model.set_value(cdt, cdn, "amount", 0);
        frappe.throw(__("Please select an account first !!"))
      }
    } else if (row.amount != 0) {
      frappe.model.set_value(cdt, cdn, "amount", 0);
      frappe.throw(__("Please select a shareholder first !!"))
    }
  },
});
