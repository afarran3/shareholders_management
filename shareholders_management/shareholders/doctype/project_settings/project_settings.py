# -*- coding: utf-8 -*-
# Copyright (c) 2020, Ahmad Al-Farran and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ProjectSettings(Document):
	pass

@frappe.whitelist()
def get_project_settings():
    return frappe.get_single('Project Settings')
