# -*- coding: utf-8 -*-
from DataBase import sql
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect

from common.To_back import To_Back
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from collections import OrderedDict

import django
import os
from login import auth
import json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dailyfresh.settings")
django.setup()

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

@auth
# 接收POST请求数据
def Password_updata(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    # reportid = request.session.get('userid', '')
    userid_person = request.session.get('userid', '')
    # print("id :"+userid_person)
    # username = request.session.get('username', '')

    result = sql.Detail_Person(userid_person)
    '''
    获取页面标题，内容
    '''
    ctx['username'] = result[1]
    ctx['roleid'] = result[3]
    if ctx['roleid']=="1":
        ctx['roleid_name']="管理员"
    elif  ctx['roleid']=="2":
        ctx['roleid_name'] = "普通人员"
    if To_Back(request):
        return redirect("/personal-management")
    if request.method == "POST":
        if request.POST.has_key('edit'):
            roleid = request.POST['roleid']
            if request.POST['password'] :
                # print( request.POST['username'])
                username = request.POST['username']
                password = request.POST['password']
                roleid=request.POST['roleid']
                detail = sql.Updata_PerSon(userid_person, username,password,roleid)
                ctx['result'] = u"修改成功"
                ctx['username'] = request.POST['username']
                ctx['password'] = request.POST['password']
                for ch in password.decode('utf-8'):
                    if ch >= u'\u4e00' and ch <= u'\u9fa5':
                        return HttpResponse("密码不能为中文")
                # print(ctx['result'])
                return render(request, "password-updata.html", ctx)
            else:
                # print(ctx['result'])
                ctx['result'] = u"请填入密码"
    # print( ctx['roleid_name'])
    return render(request, "password-updata.html", ctx)
