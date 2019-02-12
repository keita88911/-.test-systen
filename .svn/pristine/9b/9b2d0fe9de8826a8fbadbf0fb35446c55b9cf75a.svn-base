# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect
from django.http import JsonResponse
import json
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from collections import OrderedDict
import MySQLdb
import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dailyfresh.settings")
django.setup()

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


def api_login(request):
    # if request.method == 'GET':

        return JsonResponse({"msg":"ok!"})