// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt
var label_value = __("Ratio");
var valedate_sale_date = 0;
frappe.ui.form.on('Project', {
  refresh: function(frm, doc, cdt, cdn) {
    $('*[data-fieldname="project_shareholder"]').find('.grid-remove-rows').show();
    $('*[data-fieldname="project_shareholder"]').find('.grid-remove-all-rows').hide();
    $('*[data-fieldname="project_shareholder"]').find('.grid-add-row').show();
    frm.events.get_project_settings(frm, "all");
    if(frm.doc.docstatus){
      frm.set_intro(__("This Project has been sold."));
    }
    else{
      frm.set_intro(__("Project information, Insert all project's informations."));
    }
    if (frm.is_new() != 1) {
      frm.page.btn_secondary.hide()
      if (frm.doc.is_amounts_deducted) {
        $('*[data-fieldname="project_shareholder"]').find('.grid-remove-rows').hide();
        $('*[data-fieldname="project_shareholder"]').find('.grid-add-row').hide();
        let meta = frappe.meta.docfield_list["Project Shareholder"];
        for (var i = 0; i < meta.length; i++) {
          if (meta[i].fieldname != "description") {
            if (meta[i].fieldname != "company_ratio") {
              var df = frappe.meta.get_docfield("Project Shareholder", meta[i].fieldname, frm.doc.name);
              df.read_only = 1;
            }
          }
        }
      }
      if (!frm.doc.is_amounts_deducted && frm.doc.project_shareholder.length > 0) {
        frm.events.add_sync_button(frm);
      }

      if (frm.doc.is_amounts_deducted && !frm.doc.sold) {
        frm.add_custom_button(__("Sale"), () => {
          frappe.prompt([
            {
              fieldname: "buyer_name",
              fieldtype: "Data",
              label: __("Buyer Name"),
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
              reqd: 1,
              onchange: function(e) {
                if(this.value != undefined){
                  if (this.value <= frappe.datetime.nowdate()) {
                    valedate_sale_date = 1;
                  } else {
                    valedate_sale_date = 0;
                    var selected_sale_date = this.value;
                    this.value = undefined;
                    this.refresh();
                    frappe.throw(__("This date {0} has not come yet!!", [selected_sale_date.bold()]));
                  }
                }
              }
            }
          ], (data) => {
            if(valedate_sale_date){
              frm.doc.sold = 1;
              frm.doc.end_date = data.sale_date;
              frm.doc.buyer_name = data.buyer_name;
              frm.doc.sale_amount = data.sale_amount;
              frm.doc.unit_sale_amount = data.sale_amount / frm.doc.number_of_units;
              console.log(data.sale_amount / frm.doc.number_of_units);
              frm.events.calc_ratio(frm, data.sale_amount);
              frm.save('Submit');
              setTimeout(function(){
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
                    // frappe.show_alert({
                    //   message: __("Project has been sold to {0} successfully.",[data.buyer_name.bold()]),
                    //   indicator: 'blue'
                    // });
                    frappe.msgprint(__("Project {0} has been sold to {1} FOR {2}.",[frm.doc.project_name.bold(),
                                                                                    data.buyer_name.bold(),
                                                                                    frm.events.fmt_money(frm, data.sale_amount)]));
                  }
                });
              }, 600);
            }
          }, __("Sale Informations"));
        }).toggleClass('btn-primary');

      }
    }
  },

  add_sync_button: (frm) => {
    frm.add_custom_button(__("Sync accounts"), () => {
      if (frm.doc.total_cost > frm.doc.total_shareholding_amount) {
        frappe.throw(__("Please add other shareholders or increase ratios of the current shareholders' so that the total shareholding amounts equals the total cost of the project!!"))
      } else if (frm.doc.total_cost < frm.doc.total_shareholding_amount) {
        frappe.throw(__("Please delete some shareholders or decrease ratios of the current shareholders' so that the total shareholding amounts equals the total cost of the project!!"))
      } else {
        frappe.confirm(
          __("This will deduct shareholders' amounts from thire accounts, Are you sure!!"),
          function() {
            if (frm.doc.project_shareholder) {
              frappe.xcall('shareholders_management.shareholders.doctype.project.project.submit_shareholdedrs_withdrawal', {
                "project_name": frm.doc.project_name,
                "start_date": frm.doc.start_date
              }).then(r => {
                if (r == 1) {
                  frm.doc.is_amounts_deducted = 1;
                  frappe.msgprint(__("Shareholders' accounts have been deducted successfully.").bold());
                  frm.save();
                } else {
                  frappe.show_alert({
                    message: __("There is no shareholders for this project yet!!"),
                    indicator: 'red'
                  });
                }
              });
            }
          },
          function() {
            frappe.show_alert({
              message: __("You have not deducted the amounts from Shareholders' accounts yet!!"),
              indicator: 'red'
            });
          })
      }
    }).toggleClass('btn-primary');
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
  },

  after_save: (frm) => {
    if(!frm.doc.sold){
      frm.reload_doc();
    }
  },

  currency: (frm) => {
    if (frm.doc.currency != undefined && frm.doc.company_name) {
      frm.events.get_project_settings(frm, "stock");
    }
  },

  unit_cost: (frm) => {
    frm.events.set_total_cost(frm)
  },

  number_of_units: (frm) => {
    frm.events.set_total_cost(frm)
  },

  ratio_type: (frm, cdt, cdn) => {
    if (frm.doc.ratio_type == "Stock") {
      frm.events.get_project_settings(frm, "stock");
    }
    else {
      frm.doc.stock_value = undefined;
      frm.refresh_fields("stock_value");
    }
    setTimeout(function(){
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
    }, 100);
  },

  calc_ratio: (frm, sale_amount) => {
    var profit = sale_amount - frm.doc.total_cost;
    var stock_number = frm.doc.total_cost / frm.doc.stock_value;
    var ps = frm.doc.project_shareholder;
    var company_profit = 0;
    if (frm.doc.ratio_type == "Stock") {
      for (var i = 0; i < ps.length; i++) {
        company_profit = ((ps[i].company_ratio / 100) * ((profit / stock_number) * ps[i].ratio));
        frm.doc.company_profit = frm.doc.company_profit + company_profit;
        ps[i].amount_after_sale = (((profit / stock_number) * ps[i].ratio) + ps[i].amount) - company_profit;
        ps[i].net_pl = ((profit / stock_number) * ps[i].ratio) - company_profit;
      }
      frm.doc.net_pl = sale_amount - frm.doc.company_profit;
      frm.refresh_fields("project_shareholder");
      frm.refresh_fields("company_profit");
      frm.refresh_fields("net_pl");
    }
    else {
      for (var i = 0; i < ps.length; i++) {
        company_profit = ((ps[i].company_ratio / 100) * ((ps[i].ratio / 100) * profit));
        frm.doc.company_profit = frm.doc.company_profit + company_profit;
        ps[i].amount_after_sale = (((ps[i].ratio / 100) * profit) + ps[i].amount) - company_profit;
        ps[i].net_pl = ((ps[i].ratio / 100) * profit) - company_profit;
      }
      frm.doc.net_pl = sale_amount - frm.doc.company_profit;
      frm.refresh_fields("project_shareholder");
      frm.refresh_fields("company_profit");
      frm.refresh_fields("net_pl");
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

  project_shareholder_on_form_rendered: (frm, grid_row, cdt, cdn) => {
    frm.events.change_ratio_label(frm, cdt, cdn, label_value);
    if(frm.doc.is_amounts_deducted){
      $(".grid-delete-row").hide();
    }
  },

  set_total_cost: (frm) => {
    if (frm.doc.unit_cost && frm.doc.number_of_units) {
      frm.doc.total_cost = frm.doc.unit_cost * frm.doc.number_of_units;
      frm.refresh_fields("total_cost");
      frm.events.set_remaining_amount(frm);
    }
  },

  get_project_settings: (frm, chk_for) => {
    frappe.xcall('shareholders_management.shareholders.doctype.project_settings.project_settings.get_project_settings', {}).then(r => {
      var stock_values = r["stock_values"];
      var company_name = r["company_name"];
      if (chk_for == "all") {
        if (stock_values == '' && !company_name) {
          frappe.set_route("Form", "Project Settings");
          frappe.throw(__("Please set a 'stock values' and 'company name' in 'Project Settings' first!!"));
        }
        if (stock_values != '') {
          frm.events.set_stock_value(frm, stock_values);
          if(!company_name){
            frappe.set_route("Form", "Project Settings");
            frappe.throw(__("Please set a 'company name' in 'Project Settings' first!!"));
          }
        }
        if (company_name) {
          frm.events.set_company_name(frm, company_name);
          if(stock_values == ''){
            frappe.set_route("Form", "Project Settings");
            frappe.throw(__("Please set a 'stock values' in 'Project Settings' first!!"));
          }
        }
      }
      else if (chk_for == "stock") {
        if (stock_values != '') {
          frm.events.set_stock_value(frm, stock_values);
        }
      }
    });
  },

  set_stock_value: (frm, stock_values) => {
    var found = 0;
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
      let d = frappe.msgprint({
        title: __('Go to Project Settings?'),
        message: __("There is no stock value for {0} currency, to set it go to 'Project Settings'!!",[frm.doc.currency.bold()]),
        indicator: 'red',
        primary_action: {
          'label': 'Yes',
          'client_action': 'frappe.set_route',
          'args': ["Form", "Project Settings"]
        }
      });
    }
  },

  set_company_name: (frm, company_name) => {
    if(!frm.doc.sold){
      if (frm.doc.company_name && frm.doc.company_name != company_name) {
        frappe.confirm(
          __("This project company is not the same company in 'Project Settings', do you want to change project company From {0} To {1}",[frm.doc.company_name.bold(), company_name.bold()]),
          function() {
            frm.doc.company_name = company_name;
            frm.refresh_fields("company_name");
            frm.save();
            frappe.show_alert({
              message: __("Project Company changed successfully."),
              indicator: 'green'
            });
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
  },

  get_total_shareholdering_amount: (frm, cdt, cdn) => {
    var total_amount = 0;
    for (var i = 0; i < frm.doc.project_shareholder.length; i++) {
      total_amount = total_amount + frm.doc.project_shareholder[i].amount;
    }
    frm.doc.total_shareholding_amount = total_amount;
    frm.refresh_fields("total_shareholdering_amount");
    frm.events.set_remaining_amount(frm);
  },

  set_remaining_amount: (frm) => {
    frm.doc.remaining_amount = frm.doc.total_cost - frm.doc.total_shareholding_amount;
    frm.refresh_fields("remaining_amount");
  },

  change_ratio_label: (frm, cdt, cdn, labelValue) => {
    var label = labelValue.bold();
    frm.events.change_field_label("ratio", label)
  },

  change_field_label: function(fieldName, newValue) {
    var mylabel = $("div[data-fieldname=" + fieldName + "]").closest('div').find('label');
    mylabel.html(__(newValue));
  },

  fmt_money: (frm, amount) => {
    var formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: frm.doc.currency
    });
    return formatter.format(amount).bold();
  }

});

frappe.ui.form.on("Project Shareholder", {
  project_shareholder_add: function(frm, cdt, cdn) {
    if(frm.doc.project_shareholder.length <= 1 && !frm.is_new()){
      frm.events.add_sync_button(frm);
    }
    let row = frm.selected_doc;
    frm.cscript.check = function(doc) {
      if (row.shareholder_name != undefined) {
        if (row.account != undefined) {
          frappe.xcall('shareholders_management.shareholders.doctype.project.project.get_shareholder_available_balance', {
            "account": row.account
          }).then(r => {
            var available_balance = r;
            frappe.msgprint(__("{0}'s available balance = {1}.",
              [row.shareholder_name.bold(), frm.events.fmt_money(frm, available_balance)]));
          });
        } else {
          frappe.model.set_value(cdt, cdn, "amount", 0);
          frappe.throw(__("Please select an account first!!"))
        }
      } else {
        frappe.model.set_value(cdt, cdn, "amount", 0);
        frappe.throw(__("Please select a shareholder first!!"))
      }
    };
  },

  project_shareholder_remove: function(frm, cdt, cdn) {
    if(frm.doc.project_shareholder.length <= 0){
      frm.remove_custom_button("Sync accounts");
    }
    frm.events.get_total_shareholdering_amount(frm, cdt, cdn);
  },

  amount: (frm, cdt, cdn) => {
    let row = frm.selected_doc;
    if (row.shareholder_name != undefined) {
      if (row.account != undefined) {
        if (row.amount != 0) {
          if (frm.doc.total_cost == 0 || frm.doc.total_cost == undefined) {
            frappe.model.set_value(cdt, cdn, "amount", 0);
            frappe.throw(__("Please insert Unit Type, Unit Cost and Number of Units First!!"))
          } else {
            frappe.xcall('shareholders_management.shareholders.doctype.project.project.get_shareholder_available_balance', {
              "account": row.account
            }).then(r => {
              var available_balance = r;
              if (available_balance < row.amount) {
                var amount = row.amount;
                frappe.model.set_value(cdt, cdn, "amount", 0);
                frappe.throw(__("{0} does not have {1} in his account!! his available balance = {2}.",
                  [row.shareholder_name.bold(), frm.events.fmt_money(frm, amount), frm.events.fmt_money(frm, available_balance)]));
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
        frappe.throw(__("Please select an account first!!"))
      }
    } else if (row.amount != 0) {
      frappe.model.set_value(cdt, cdn, "amount", 0);
      frappe.throw(__("Please select a shareholder first!!"))
    }
  },
});
