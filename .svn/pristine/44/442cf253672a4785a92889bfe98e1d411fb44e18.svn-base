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

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dailyfresh.settings")
django.setup()

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

@auth
# 接收POST请求数据
def Detail(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    reportid = request.session.get('reportid', '')
    userid = request.session.get('userid', '')
    username = request.session.get('username', '')
    result = sql.Detail(reportid)
    '''
    获取页面标题，内容
    '''
    ctx['title'] = result[1]
    ctx['text'] = result[4]
    if To_Back(request):
        return redirect("/week-report")
    if request.method == "POST":

        if request.POST.has_key('edit'):

            title = request.POST['title']

            text = request.POST['text']
            detail = sql.Updata(reportid, title, text)
            ctx['result'] = "修改成功"
            ctx['title'] = request.POST['title']
            ctx['text'] = request.POST['text']

            print(ctx['result'])
            return render(request, "detail.html", ctx)

        else:
            # print(ctx['result'])
            ctx['result'] = "请填入标题和内容"

    return render(request, "detail.html", ctx)
