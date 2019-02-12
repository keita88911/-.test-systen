# -*- coding: utf-8 -*-
from DataBase import sql
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect
from common.To_back import To_Back
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from collections import OrderedDict
import MySQLdb
import django
import os
import json
from login import auth
import time

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

# 接收POST请求数据
@auth
def index_1(request):
    name=request.session.get('username', '')
    roleid=request.session.get('roleid', '')
    ctx={'username':name}
    ctx['roleid']=json.dumps(roleid)
    # print(ctx['roleid'])
    print('SQL Time used: {} sec'.format(time.time() - time.time()))
    return render(request, "index_1.html",ctx)
