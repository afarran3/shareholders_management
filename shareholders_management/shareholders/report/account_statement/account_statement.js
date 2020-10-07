// Copyright (c) 2016, Ahmad Al-Farran and contributors
// For license information, please see license.txt
/* eslint-disable */

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
				frappe.model.with_doc("Shareholder Account", shareholder_account, function(r) {
					var sa = frappe.model.get_doc("Shareholder Account", shareholder_account);
					frappe.query_report.set_filter_value("from_date", moment(sa.creation).format("YYYY-MM-DD"));
					frappe.query_report.set_filter_value("to_date", moment(sa.modified).format("YYYY-MM-DD"));
					frappe.query_report.set_filter_value("currency", sa.currency);
				});
			},
			"reqd": 1
		},
		{
			"fieldname": "operation",
			"label": __("Operation Type"),
			"fieldtype": "Select",
			"options":__("All Operations") + "\n" + __("Deposit") + "\n" + __("Withdrawal"),
			"default": __("All Operations")
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
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
