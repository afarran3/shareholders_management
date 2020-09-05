# -*- coding: utf-8 -*-
# Copyright (c) 2020, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document

class ShareholderAccount(Document):
	pass
	def validate(self):
		self.validate_account()

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
	#
	#
	#
	# def validate_available_amount(self):
	# 	if not self.is_new():
	# 		total_deposits = frappe.db.sql(
    #     """
    #         SELECT sum(amount) as amount
    #         FROM `tabDeposit`
	# 		WHERE parent = %s
	# 		GROUP BY parent
    #     """, (self.name), as_dict=True)
	#
	# 		total_withdrawals = frappe.db.sql(
    #     """
    #         SELECT sum(amount) as amount
    #         FROM `tabWithdrawal`
	# 		WHERE parent = %s
	# 		GROUP BY parent
    #     """, (self.name), as_dict=True)
	#
	# 		if total_withdrawals:
	# 			self.available_balance = total_deposits[0].amount - total_withdrawals[0].amount
	# 		print("====", self.available_balance)
