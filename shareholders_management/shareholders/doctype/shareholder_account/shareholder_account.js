// Copyright (c) 2020, Ahmad Al-Farran and contributors
// For license information, please see license.txt

frappe.ui.form.on('Shareholder Account', {
  // refresh: function(frm) {

  // }
  //
  // deposit_operations: (frm) => {
  //   console.log("Hiiiiiiii");
  // },

  // validate:function(frm){
  //   var total = 0
  //   $.each(frm.doc.total_deposits, function(idx, row){
  //   total = total + row.amount
  //   })
  //   frm.set_value("total_deposits",total)
  // },


  // total_deposits: (frm) => {
  //   console.log("total_deposits");
  //   frm.doc.available_balance = frm.doc.total_deposits - frm.doc.total_withdrawals
  //   cur_frm.refresh_fields("available_balance");
  // },
  //
  // total_withdrawals: (frm) => {
  //   console.log("total_withdrawals");
  //   frm.doc.available_balance = frm.doc.total_deposits - frm.doc.total_withdrawals
  //   cur_frm.refresh_fields("available_balance");
  // },
  get_available_balance: (frm, cdt, cdn) => {
    console.log("frm.doc.deposit_operations == undefined");
    var total_deposits = 0;
    var total_withdrawals = 0;


      for (var i = 0; i < frm.doc.deposit_operations.length; i++) {
        total_deposits += frm.doc.deposit_operations[i].amount;
      }

    if(frm.doc.deposit_operations != undefined){
      console.log("frm.doc.deposit_operations != undefined");
      for (var i = 0; i < frm.doc.withdrawal_operations.length; i++) {
          total_withdrawals += frm.doc.withdrawal_operations[i].amount;
        }
    }
    else{
      console.log("frm.doc.deposit_operations == undefined");
      total_withdrawals = 0;
    }
      frm.doc.available_balance = total_deposits - total_withdrawals;
      frm.refresh_fields("total_deposits");


  }
});

// var available_balance = 0
//
// frappe.ui.form.on("Deposit", "amount", function(frm) {
//   var total_deposits = 0;
//   for (var i = 0; i < cur_frm.doc.deposit_operations.length; i++) {
//     total_deposits += cur_frm.doc.deposit_operations[i].amount;
//   }
//   cur_frm.doc.total_deposits = total_deposits;
//   cur_frm.refresh_fields("total_deposits");
// });
// frappe.ui.form.on("Withdrawal", "amount", function(frm) {
//   var total_withdrawals = 0;
//   for (var i = 0; i < cur_frm.doc.withdrawal_operations.length; i++) {
//     total_withdrawals += cur_frm.doc.withdrawal_operations[i].amount;
//   }
//   cur_frm.doc.total_withdrawals = total_withdrawals;
//   cur_frm.refresh_fields("total_withdrawals");
// });
//
frappe.ui.form.on("Withdrawal", {
  withdrawal_operations_remove: function(frm, cdt, cdn) {
    console.log("Hiiiihhhhhhhhiiii");
    frm.events.get_available_balance(frm, cdt, cdn);
  },
  amount: (frm, cdt, cdn) => {
    console.log("Hiiiilllllllliiii");
    frm.events.get_available_balance(frm, cdt, cdn);
  },
});

frappe.ui.form.on("Deposit", {
  deposit_operations_remove: function(frm, cdt, cdn) {
    console.log("Hiiiiooooooooiiii");
    frm.events.get_available_balance(frm, cdt, cdn);
  },
  amount: (frm, cdt, cdn) => {
    console.log("Hiiiiytyiiii");
      frm.events.get_available_balance(frm, cdt, cdn);
  },
});
