# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in shareholders_management/__init__.py
from shareholders_management import __version__ as version

setup(
	name='shareholders_management',
	version=version,
	description='App for managing shareholders and thire financial accounts annd all things that thay sharehold in',
	author='Ahmad Al-Farran',
	author_email='afarran1992@gmail.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
