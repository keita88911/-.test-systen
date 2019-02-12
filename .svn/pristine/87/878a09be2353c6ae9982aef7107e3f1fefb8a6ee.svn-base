# -*- coding: utf-8 -*-
from DataBase import sql
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect
from common.To_back import To_Back
from api_request import *
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from collections import OrderedDict
import MySQLdb
import django
import os
from login import auth
import json
import re
from common.recursive import *

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "dailyfresh.settings")
django.setup()

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


@auth
# 接收POST请求数据
def add_day_report(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    userid = request.session.get('userid', '')
    username = request.session.get('username', '')
    response = {}
    project = sql.Search_main_project()
    data_project = []
    for i in project:
        text1 = OrderedDict()
        text1['id'] = i[0]
        text1['projectname'] = i[1]
        text1['parentid'] = i[2]
        text1['level'] = [3]
        data_project.append(text1)

    response['data_project'] = data_project
    # print( response['data_project'] )
    if To_Back(request):
        return redirect("/day-report")
    if request.POST.has_key('add_one'):
        if request.session.get('posttoken', '') == 'yes':
            # print("yes")
            # api_belong=str(recursive.get_father_project(api_project))
            projectid = request.POST['projectid']
            day_bug = request.POST['day_bug']
            day_bug_off = request.POST['day_bug_off']
            creat_time = request.POST['creat_time']
            # print(username, creat_time)
            creat_time1 = sql.add_day_report_is_new(username, creat_time,projectid)

            if creat_time1:
                print(u"当日已存在日报")
                return HttpResponse("此项目当天已存在日报，请回日报主页进行编辑")
                # print(userid,username, day_bug, day_bug_off, creat_time,projectid)

            else:
                print(u"当日不存在日报")
                add = sql.add_day_report(userid, username, day_bug, day_bug_off, creat_time, projectid)
                if add[0]:
                    del request.session['posttoken']
                    response['result'] = u"创建成功"
                    response['msg'] = json.dumps(add[1])
                    # print(add[1])
                    return render(request, "add-day-report.html", response)
                else:
                    response['result'] = u"创建失败"
                    response['msg'] = json.dumps(add[1])
                    # print(add[1])
                    return render(request, "add-day-report.html", response)

        else:
            return HttpResponse("请勿重复提交")

    return render(request, "add-day-report.html", response)
