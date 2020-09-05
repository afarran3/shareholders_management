from __future__ import unicode_literals
from frappe import _

def get_data():
    return [
      {
        "label":_("Projects"),
        "icon": "octicon octicon-briefcase",
        "items": [
            {
              "type": "doctype",
              "name": "Project",
              "label": _("Projects"),
              "description": _("Create and manage projects."),
            },
            # {
            #   "type": "doctype",
            #   "name": "Library Member",
            #   "label": _("Library Member"),
            #   "description": _("People whohave enrolled for membership in the library."),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Membership",
            #   "label": _("Library Membership"),
            #   "description": _("People who have taken membership for the library"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Transaction",
            #   "label": _(""),
            #   "description": _("Issuing an article or returning an article are the transactions taking place."),
            # }
          ]
      },
      {
        "label":_("Shareholders"),
        # "icon": "octicon octicon-briefcase",
        "items": [
            {
              "type": "doctype",
              "name": "Shareholder Account",
              "label": _("Shareholders Accounts"),
              "description": _("Create and manage shareholders accounts"),
            },
            # {
            #   "type": "doctype",
            #   "name": "Library Member",
            #   "label": _("Library Member"),
            #   "description": _("People whohave enrolled for membership in the library."),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Membership",
            #   "label": _("Library Membership"),
            #   "description": _("People who have taken membership for the library"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Transaction",
            #   "label": _(""),
            #   "description": _("Issuing an article or returning an article are the transactions taking place."),
            # }
          ]
      },
      {
        "label":_("Settings"),
        # "icon": "octicon octicon-briefcase",
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
              "label": _("Unit Types"),
              "description": _("Create and manage unit types"),
            },
            # {
            #   "type": "doctype",
            #   "name": "Library Membership",
            #   "label": _("Library Membership"),
            #   "description": _("People who have taken membership for the library"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Transaction",
            #   "label": _(""),
            #   "description": _("Issuing an article or returning an article are the transactions taking place."),
            # }
          ]
      },
      {
        "label":_("Reports"),
        # "icon": "octicon octicon-briefcase",
        "items": [
            # {
            #   "type": "doctype",
            #   "name": "Shareholder",
            #   "label": _("Shareholders"),
            #   "description": _("Create and manage shareholders"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Unit Type",
            #   "label": _("Unit Types"),
            #   "description": _("Create and manage unit types"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Membership",
            #   "label": _("Library Membership"),
            #   "description": _("People who have taken membership for the library"),
            # },
            # {
            #   "type": "doctype",
            #   "name": "Library Transaction",
            #   "label": _(""),
            #   "description": _("Issuing an article or returning an article are the transactions taking place."),
            # }
          ]
      }
  ]
