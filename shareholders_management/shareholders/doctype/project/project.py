# -*- coding: utf-8 -*-
# Copyright (c) 2020, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document

class Project(Document):
	def validate(self):
		self.validate_total_cost()

	def validate_total_cost(self):
		if self.unit_cost and self.number_of_units:
			self.total_cost = self.unit_cost * self.number_of_units
