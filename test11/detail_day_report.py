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
def detail_day_report(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    userid = request.session.get('userid', '')
    username = request.session.get('username', '')
    day_reportid = request.session.get('day_reportid', '')
    response = {}
    project = sql.detail_day_report(day_reportid)
    # print(day_reportid)
    data_project = []
    for i in project:
        text1 = OrderedDict()
        text1['id'] = i[0]
        text1['userid'] = i[1]
        text1['username'] = i[2]
        text1['day_bug'] = i[3]
        text1['day_bug_off'] = i[4]
        text1['creat_time'] = str(i[5])[0:10]
        text1['updata_time'] = str(i[6])[0:10]
        text1['project_id'] = i[7]
        text1['project_name'] = i[8]
        data_project.append(text1)

    response['data_project'] = data_project
    print( response['data_project'] )
    if To_Back(request):
        return redirect("/day-report")
    if request.POST.has_key('edit'):

        # print("yes")
        # api_belong=str(recursive.get_father_project(api_project))
        projectid = request.POST['projectid']
        day_bug = request.POST['day_bug']
        day_bug_off = request.POST['day_bug_off']
        creat_time = request.POST['creat_time']
        # print(username, creat_time)
        add = sql.updata_day_report(day_reportid,day_bug, day_bug_off,)
        if add:
            response['result'] = u"创建成功"
            response['msg'] = json.dumps("更新成功")
            # print(add[1])
            return render(request, "detail-day-report.html", response)


    return render(request, "detail-day-report.html", response)
