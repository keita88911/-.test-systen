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
def Add_Phone(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    # userid = request.session.get('userid', '')
    # username = request.session.get('username', '')
    if To_Back(request):
        return redirect("/borrow-phone")
    if request.POST:
        if request.session.get('posttoken', '') == 'yes':
            if request.POST['phonename'] and request.POST['phonecode']:

                phonename = request.POST['phonename']
                phonecode = request.POST['phonecode']


                Add = sql.Add_Phone(phonename, phonecode)
                #姓名重复验证
                if Add[0]:
                    ctx['result'] =u"创建成功"
                    ctx['msg'] = json.dumps(Add[1])
                    del request.session['posttoken']
                else:
                    ctx['result'] = u"创建失败"
                    ctx['msg'] =json.dumps(Add[1])
                return render(request, "add-phone.html", ctx)
            else:
                ctx['result'] = u"创建失败"
                ctx['msg'] =json.dumps( u"请填入完整信息")
                return render(request, "add-phone.html", ctx)
        else:
            return HttpResponse("请勿重复提交")

    return render(request, "add-phone.html", ctx)
