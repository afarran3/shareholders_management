# Copyright (c) 2013, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
# from erpnext.projects.doctype.log_frame.log_frame import get_logframe, get_child_logframe, get_add_output_to_the_main_goal
from six import BytesIO
from frappe.utils import getdate
# from docxtpl import DocxTemplate
import os


def execute(filters=None):
    validate_filters(filters)
    columns = get_columns(filters)
    data = get_data(filters)
    return columns, data


def validate_filters(filters):
    filters.from_date = getdate(filters.from_date)
    filters.to_date = getdate(filters.to_date)
    if filters.from_date > filters.to_date:
        frappe.throw(_("'From Date' cannot be greater than 'To Date'"))


def get_columns(filters):
    columns = [
        {
            "label": _("Date"),
            "fieldtype": "Date",
            "fieldname": "date",
            "width": '110'
        },
        {
            "label": _("Operation Type"),
            "fieldtype": "Data",
            "fieldname": "operation",
            "width": '100'
        },
        {
            "label": _("Amount"),
            "fieldtype": "Currency",
            "fieldname": "amount",
            "width": '170'
        },
        {
            "label": _("Operation Purpose"),
            "fieldtype": "Data",
            "fieldname": "purpose",
            "width": '170'
        },
        {
            "label": _("Note"),
            "fieldtype": "Data",
            "fieldname": "description",
            "width": '800',
        },
    ]
    return columns


def get_conditions(filters):
    conditions = {}
    if filters.shareholder_account and filters.from_date and filters.to_date:
        conditions["operation"] = filters.operation
        conditions["shareholder_account"] = filters.shareholder_account
        conditions["from_date"] = filters.from_date
        conditions["to_date"] = filters.to_date
    return conditions


def get_data(filters):
    data = []
    conditions = get_conditions(filters)
    if conditions:
        if conditions["operation"] == _("Deposit"):
            operations = frappe.db.sql("""
        		SELECT deposit_date as op_date, parentfield as op, amount, deposit_type as op_type, description
        		FROM `tabDeposit`
        		WHERE parent = %s
        		AND deposit_date BETWEEN %s AND %s
        		ORDER BY deposit_date""", (conditions["shareholder_account"], conditions["from_date"], conditions["to_date"]), as_dict=True)
        elif conditions["operation"] == _("Withdrawal"):
            operations = frappe.db.sql("""
        		SELECT withdrawal_date as op_date, parentfield as opr, amount, withdrawal_type as op_type, description
        		FROM `tabWithdrawal`
        		WHERE parent = %s
        		AND withdrawal_date BETWEEN %s AND %s
        		ORDER BY withdrawal_date""", (conditions["shareholder_account"], conditions["from_date"], conditions["to_date"]), as_dict=True)
        else:
            operations = frappe.db.sql("""
        		SELECT withdrawal_date as op_date, parentfield as opr, amount, withdrawal_type as op_type, description
        		FROM `tabWithdrawal`
        		WHERE parent = %(parent)s
        		AND withdrawal_date BETWEEN %(from)s AND %(to)s
        		UNION
        		SELECT deposit_date as op_date, parentfield as op, amount, deposit_type as op_type, description
        		FROM `tabDeposit`
        		WHERE parent = %(parent)s
        		AND deposit_date BETWEEN %(from)s AND %(to)s
        		ORDER BY op_date""", {"parent": conditions["shareholder_account"],
                                "from": conditions["from_date"],
                                "to": conditions["to_date"]}, as_dict=True)

        if operations:
            for i in operations:
                opr = _("Deposit")
                if i.opr == 'withdrawal_operations':
                    opr = _("Withdrawal")
                data.append({"date": i.op_date, "operation": opr, "amount": i.amount,
                             "purpose": _(i.op_type), "description": i.description})
    return data
