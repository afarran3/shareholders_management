// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt

frappe.ui.form.on('Project', {
	// refresh: function(frm) {

	// }
  setup: function(frm) {
    frm.set_query('account', 'project_shareholder', function(doc, cdt, cdn) {
      // console.log("============");
      var child = locals[cdt][cdn];
      return {
        filters: {
          "currency": ["=", frm.doc.currency],
          "shareholder_name": ["=", child.shareholder_name],
        }
      }
    });
    frm.set_query('shareholder_name', 'project_shareholder', function(doc, cdt, cdn) {
      // console.log("============");
      var shareholders = [];
      // var child = locals[cdt][cdn];
      for (var i = 0; i < frm.doc.project_shareholder.length; i++) {
        shareholders.push(frm.doc.project_shareholder[i].shareholder_name);
      }
      return {
        filters: {
          // "currency": ["=", frm.doc.currency],
          "shareholder_name": ["not in", shareholders]
        }
      }
    });
  },
  // onload: function(frm) {
  //   frm.set_query('account', 'project_shareholder', function() {
  //      console.log("============");
  //      // var row  = locals[cdt][cdn];
  //      var filters = {
  //        currency: ["=", frm.doc.currency]
  //      };
  //
  //      // if (row.shareholder_name) {
  //      //   console.log(row.shareholder_name);
  //      //   // filters["filters"].push(["Bin", "item_code", "=", row.item_code]);
  //      //   filters['shareholder_name'] = row.shareholder_name;
  //      // }
  //
  //      return {
  //        filters: filters
  //      };
  //    });
  //  },

  // set_filters: (frm) => {
  //   frm.set_query('account', 'project_shareholder', function(doc, cdt, cdn) {
  //       console.log("============");
  //       var child = locals[cdt][cdn];
  //       return {
  //         filters: {
  //           "currency": ["=", frm.doc.currency],
  //           "shareholder_name": ["=", child.shareholder_name],
  //         }
  //       }
  //     });
  // },

  unit_cost: (frm) =>{
    frm.events.get_total_cost(frm)
  },
  number_of_units: (frm) =>{
    frm.events.get_total_cost(frm)
  },
  get_total_cost: (frm) => {
    if (frm.doc.unit_cost && frm.doc.number_of_units){
      frm.doc.total_cost = frm.doc.unit_cost * frm.doc.number_of_units;
      frm.refresh_fields("total_cost");
    }
  },
  // get_available_balance: (frm, amount, account) => {
  //   frappe.xcall('shareholders_management.shareholders_management.doctype.task_resource_request.task_resource_request.get_standard_rate_resource', {
  //     "project": frm.doc.project,
  //     "resource": row.resource_name,
  //     "request_start_date": row.request_start_date,
  //     "request_end_date": row.request_end_date,
  //     "resource_type": row.resource_type,
  //     "work_resource_type": row.work_resource_type,
  //     "cost": row.cost,
  //     "material_unit": row.material_unit,
  //     "activity_type": row.activity_type,
  //     "price_list": row.price_list,
  //     "work_hour": row.work_hour
  //   }).then(r => {
  //     console.log(r);
  //     // frappe.model.set_value(cdt, cdn, 'total_cost', r);
  //     frappe.model.set_value(cdt, cdn, 'total_cost', r["cost_in_project_currency"])
  //     frappe.model.set_value(cdt, cdn, 'total_cost_in_resource_currency', r["cost_in_resource_currency"])
  //   });
  // }
});

frappe.ui.form.on("Project Shareholder", {
  // deposit_operations_remove: function(frm, cdt, cdn) {
  //   console.log("Hiiiiiiii");
  //   frm.events.get_available_balance(frm, cdt, cdn);
  // },
  // shareholder_name: (frm, cdt, cdn) => {
  //   // console.log("Hiiiiiiii");
  //   // frm.events.set_filters(frm);
  // },

  amount: (frm, cdt, cdn) => {
    // console.log("=-=-=-=");
    let row = frm.selected_doc;
    if (row.amount != undefined){
      if(frm.doc.total_cost == 0 || frm.doc.total_cost == undefined){
        // console.log("++++++++");
        frappe.model.set_value(cdt, cdn, "amount", undefined);
        frappe.throw(__("Please insert Unit Type, Unit Cost and Number of Units First !!"))
      }
      // else {
      //   frm.events.get_available_balance(frm, row.amount, row.account);
      // }
    }
    // else{
    //   console.log(frm.doc.total_cost);
    // }
  },
});
