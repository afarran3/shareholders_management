// Copyright (c) 2016, Ahmad Al-Farran and contributors
// For license information, please see license.txt
/* eslint-disable */
var from_date = undefined;
var to_date = undefined;
frappe.query_reports["Account statement"] = {
	"filters": [
		{
			"fieldname": "shareholder_name",
			"label": __("Shareholder Name"),
			"fieldtype": "Link",
			"options": "Shareholder",
			"on_change": function(query_report) {
				var shareholder_name = query_report.get_values().shareholder_name;
				frappe.query_report.set_filter_value("shareholder_account","");
			},
			"reqd": 1
		},
		{
			"fieldname": "shareholder_account",
			"label": __("Shareholder Account"),
			"fieldtype": "Link",
			"options": "Shareholder Account",
			"get_query": function() {
				var shareholder_name = frappe.query_report.get_filter_value('shareholder_name');
				return {
					"doctype": "Shareholder Account",
					"filters": {
						"shareholder_name": shareholder_name,
					}
				}
			},
			"on_change": function(query_report) {
				var shareholder_account = query_report.get_values().shareholder_account;
				if (!shareholder_account) {
					frappe.query_report.set_filter_value("from_date", "");
					frappe.query_report.set_filter_value("to_date", "");
					frappe.query_report.set_filter_value("currency", "");
					return;
				}
				frappe.call({
					method: "shareholders_management.shareholders.report.account_statement.account_statement.all_operations_dates",
					args: {
						parent: query_report.get_filter_value("shareholder_account"),
						operation: query_report.get_filter_value("operation")
					},
					callback: function(r) {
						from_date = r.message[0].from_date;
						frappe.query_report.set_filter_value("from_date", from_date);
						to_date = r.message[0].to_date;
						frappe.query_report.set_filter_value("to_date", to_date);
					}
				});
				frappe.model.with_doc("Shareholder Account", shareholder_account, function(r) {
					var sa = frappe.model.get_doc("Shareholder Account", shareholder_account);
					frappe.query_report.set_filter_value("currency", sa.currency);
				});
			},
			"reqd": 1
		},
		{
			"fieldname": "operation",
			"label": __("Operation Type"),
			"fieldtype": "Select",
			"options": __("All Operations") + "\n" + __("Deposit") + "\n" + __("Withdrawal"),
			"default": __("All Operations"),
			"on_change": function(query_report) {
				frappe.call({
					method: "shareholders_management.shareholders.report.account_statement.account_statement.all_operations_dates",
					args: {
						parent: query_report.get_filter_value("shareholder_account"),
						operation: query_report.get_filter_value("operation")
					},
					callback: function(r) {
						from_date = r.message[0].from_date;
						frappe.query_report.set_filter_value("from_date", from_date);
						to_date = r.message[0].to_date;
						frappe.query_report.set_filter_value("to_date", to_date);
					}
				});
			}
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"on_change": function(query_report) {
				var f_date = query_report.get_filter_value("from_date");
				var t_date = query_report.get_filter_value("to_date");
				if (!f_date) {
					frappe.query_report.refresh();
					return;
				}
				if (f_date > t_date) {
					frappe.query_report.set_filter_value("from_date", from_date);
					frappe.throw(__("You can not enter a date after {0}!!",[t_date]))
				}
				frappe.query_report.refresh();
			},
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"on_change": function(query_report) {
				var f_date = query_report.get_values().from_date;
				var t_date = query_report.get_values().to_date;
				if (!t_date) {
					frappe.query_report.refresh();
					return;
				}
				if (t_date < f_date) {
					frappe.query_report.set_filter_value("to_date", to_date);
					frappe.throw(__("You can not enter a date before {0}!!",[f_date]))
				}
				frappe.query_report.refresh();
			},
		},
		{
			"fieldname": "currency",
			"label": __("Currency"),
			"fieldtype": "Link",
			"options": "Currency",
			"read_only": 1
		},
	]
};
