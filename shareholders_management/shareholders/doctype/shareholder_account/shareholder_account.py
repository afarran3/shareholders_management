# -*- coding: utf-8 -*-
# Copyright (c) 2020, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document

class ShareholderAccount(Document):

	def validate(self):
		self.validate_account()
		self.validate_available_amount()

	def validate_account(self):
		if self.is_new():
			shareholder_accounts = frappe.db.sql(
		        """
		            SELECT name
		            FROM `tabShareholder Account`
					WHERE shareholder_name = %s
					AND currency = %s
		        """, (self.shareholder_name, self.currency), as_dict=True)
			if shareholder_accounts:
				frappe.throw(_("{0} already has account in {1} currency !!").format(frappe.bold(self.shareholder_name),
                                                                     frappe.bold(self.currency)))


	def validate_available_amount(self):
		if not self.is_new():
			if self.available_balance < 0:
				frappe.throw(_("Balance can not be less than ZERO !!"))
			else:
				frappe.msgprint(_("{0}'s available balance = {1} {2}").format(frappe.bold(self.shareholder_name),
																	frappe.bold(self.available_balance),
																	frappe.bold(self.currency)))

@frappe.whitelist()
def get_shareholder_projects(doctype, txt, searchfield, start, page_len, filters):
	if filters:
		shareholder_name = filters.get("shareholder_name")
		currency = filters.get("currency")
		sps = frappe.db.sql(
			"""
				SELECT parent
				FROM `tabProject Shareholder`
				WHERE shareholder_name = %s
			""", (shareholder_name))
		return frappe.db.sql(
			"""
				SELECT project_name
				FROM `tabProject`
				WHERE name in %s
				AND currency = %s
			""", (sps, currency))

@frappe.whitelist()
def get_shareholding_amount(project, shareholder_name):
	sa = frappe.db.sql(
		"""
			SELECT amount
			FROM `tabProject Shareholder`
			WHERE shareholder_name = %s
			AND parent = %s
		""", (shareholder_name, project), as_dict = True)
	if sa:
		return sa[0].amount
	else:
		return 0

@frappe.whitelist()
def get_company_projects(doctype, txt, searchfield, start, page_len, filters):
	company_name = filters.get("company_name")
	currency = filters.get("currency")
	return frappe.db.sql(
			"""
				SELECT name
				FROM `tabProject`
				WHERE company_name = %s
				AND currency = %s
			""", (company_name, currency))
