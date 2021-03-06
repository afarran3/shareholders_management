# -*- coding: utf-8 -*-
# Copyright (c) 2020, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt
from frappe.model.document import Document

class Project(Document):
	def validate(self):
		self.validate_total_cost()

	def validate_total_cost(self):
		# path = frappe.get_route()
		# frappe.msgprint(path)
		if self.unit_cost and self.number_of_units:
			self.total_cost = self.unit_cost * self.number_of_units

@frappe.whitelist()
def get_shareholder_available_balance(account):
	sab = frappe.db.sql(
		"""
			SELECT available_balance
			FROM `tabShareholder Account`
			WHERE name = %s
		""", (account), as_dict=True)
	if sab:
		return sab[0].available_balance

@frappe.whitelist()
def submit_shareholdedrs_withdrawal(project_name, start_date):
	shareholders_array = frappe.get_list("Project Shareholder", filters={"parent": project_name}, fields=["account", "amount"])
	if shareholders_array:
		for i in shareholders_array:
			doc = frappe.get_doc("Shareholder Account", i.account)
			description = _("In exchange for contributing in {0}.").format(project_name)
			insert_into_withdrawal_table(doc, i.amount, start_date, "Projects Shareholdings", project_name, description)
			doc.available_balance = doc.available_balance - i.amount
			doc.save()
		return True
	else:
		return False

@frappe.whitelist()
def submit_shareholdedrs_deposit(project_name, company_name, company_profit, currency, end_date):
	if flt(company_profit) != 0:
		if flt(company_profit) > 0:
			description = _("In exchange for the company's share of the profits of the project {0}.").format(project_name)
		else:
			description = _("In exchange for the company's share of the losses of the project {0}.").format(project_name)
		if not frappe.db.exists({'doctype': 'Shareholder', 'shareholder_name': company_name}):
			new_doc = frappe.new_doc("Shareholder")
			new_doc.shareholder_name = company_name
			new_doc.insert()
		company_account = frappe.get_list("Shareholder Account", filters={"shareholder_name": company_name, "currency": currency})
		if not company_account:
			new_doc = frappe.new_doc("Shareholder Account")
			new_doc.shareholder_name = company_name
			new_doc.available_balance = company_profit
			new_doc.currency = currency
			new_doc.is_company = 1
			insert_into_deposit_table(new_doc, company_profit, end_date, "Projects profits", project_name, description)
			new_doc.insert()
		else:
			for i in company_account:
				doc = frappe.get_doc('Shareholder Account', i.name)
				doc.available_balance = doc.available_balance + flt(company_profit)
				insert_into_deposit_table(doc, company_profit, end_date, "Projects proceeds", project_name, description)
				doc.save()
	shareholders_array = frappe.get_list("Project Shareholder", filters={"parent": project_name}, fields=["account", "amount", "amount_after_sale", "company_ratio"])
	if shareholders_array:
		for i in shareholders_array:
			available_balance = 0
			doc = frappe.get_doc("Shareholder Account", i.account)
			if i.amount_after_sale > i.amount:
				if i.company_ratio > 0:
					description = _("In exchange for the shareholder's share of the profits of the project {0}, after deducting {1} as company ratio.").format(project_name, frappe.utils.fmt_money((i.amount_after_sale - i.amount) * (i.company_ratio / 100)))
				else:
					description = _("In exchange for the shareholder's share of the profits of the project {0}.").format(project_name)
				profit = i.amount_after_sale - i.amount
				# description = _("In exchange for the shareholder's share of the profits of the project {0}.").format(project_name)
				insert_into_deposit_table(doc, profit, end_date, "Projects profits", project_name, description)
				available_balance = doc.available_balance + profit
			elif i.amount_after_sale < i.amount:
				if i.company_ratio > 0:
					description = _("In exchange for the shareholder's share of the loss of the project {0}, after deducting {1} as company ratio.").format(project_name, frappe.utils.fmt_money((i.amount - i.amount_after_sale) * (i.company_ratio / 100)))
				else:
					description = _("In exchange for the shareholder's share of the loss of the project {0}.").format(project_name)
				loss = i.amount - i.amount_after_sale
				# description = _("In exchange for the shareholder's share of the loss of the project {0}.").format(project_name)
				insert_into_withdrawal_table(doc, loss, end_date, "Projects losses", project_name, description)
				available_balance = doc.available_balance - loss
			else:
				available_balance = doc.available_balance
			description = _("In exchange for shareholding in the project {0}.").format(project_name)
			insert_into_deposit_table(doc, i.amount, end_date, "Projects proceeds", project_name, description)
			doc.available_balance = available_balance + i.amount
			doc.save()


def insert_into_deposit_table(doc, amount, date, type, project_name, description):
	doc.append("deposit_operations",
	{
	"amount": amount,
	"deposit_date": date,
	"deposit_type": type,
	"project": project_name,
	"description": description
	})

def insert_into_withdrawal_table(doc, amount, date, type, project_name, description):
	doc.append("withdrawal_operations",
	{
	"amount": amount,
	"withdrawal_date": date,
	"withdrawal_type": type,
	"project": project_name,
	"description": description
	})


@frappe.whitelist()
def get_doc(doc, name):
	return frappe.get_doc(doc, name)
