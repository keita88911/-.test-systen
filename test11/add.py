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

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dailyfresh.settings")
django.setup()

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

@auth
# 接收POST请求数据
def Add(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    userid = request.session.get('userid', '')
    username = request.session.get('username', '')
    if To_Back(request):
        return redirect("/week-report")
    if request.POST:
        if request.POST.has_key('add'):
            if request.session.get('posttoken','')=="yes":#增加token防止重复起单
                # print("postoken yes")
                if request.POST['title'] and request.POST['text']:
                    title = request.POST['title']
                    text = request.POST['text']
                    if len(text)>2000 or len(title)>100:
                        return HttpResponse("标题或周报内容输入过长")
                    Add = sql.Add(title, username, userid, text)
                    ctx['result'] = "创建成功"
                    ctx['title'] = request.POST['title']
                    ctx['text'] = request.POST['text']
                    del request.session['posttoken']
                    # print(ctx['result'])
                    return render(request, "add.html", ctx)
                else:
                    # print(ctx['result'])
                    ctx['result'] = "请填入标题和内容"
            else:
                return  HttpResponse("请勿重复提交")
    return render(request, "add.html",ctx)
