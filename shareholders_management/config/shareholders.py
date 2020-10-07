from __future__ import unicode_literals
from frappe import _


def get_data():
    return [
        {
            "label": _("Projects"),
            "icon": "octicon octicon-briefcase",
            "items": [
                {
                    "type": "doctype",
                    "name": "Project",
                    "label": _("Projects"),
                    "description": _("Create and manage projects."),
                }
            ]
        },
        {
            "label": _("Shareholders"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Shareholder Account",
                    "label": _("Shareholders Accounts"),
                    "description": _("Create and manage shareholders accounts"),
                }
            ]
        },
        {
            "label": _("Settings"),
            "items": [
                {
                    "type": "doctype",
                    "name": "Shareholder",
                    "label": _("Shareholders"),
                    "description": _("Create and manage shareholders"),
                },
                {
                    "type": "doctype",
                    "name": "Unit Type",
                    "label": _("Units Types"),
                    "description": _("Create and manage unit types"),
                },
                {
                    "type": "doctype",
                    "name": "Project Settings",
                    "label": _("Project Settings"),
                    "description": _("Manage Project Settings"),
                }
            ]
        },
        {
            "label": _("Reports"),
            "icon": "fa fa-table",
            "items": [
                {
                    "type": "report",
                    "is_query_report": True,
                    "name": "Account statement",
                    "doctype": "Shareholder Account",
                    "label": _("Account Statement"),
                    "onboard": 1
                }
            ]
        }
    ]
