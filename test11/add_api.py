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
def Add_Api(request):
    request.coding = "utf-8"
    ctx = {'result': '', 'success': '创建成功', 'title': '', 'text': ''}
    userid = request.session.get('userid', '')
    username = request.session.get('username', '')
    project = sql.Search_project()  # 读取所有项目分类排序
    response = {}
    prent_projectid = request.session.get('projectid', '')  # 上级页面传入的项目ID
    # print(prent_projectid)
    api_belong_two = recursive()
    api_belong_two = str(api_belong_two.get_father_project(prent_projectid))  # 根据上级页面传入项目ID查找父级项目ID
    # print(api_belong_two+"aaaaa")
    response["project_name"] = (sql.Get_project_name(api_belong_two))[0][1]  # 根据子id获取项目名称
    # print(project)
    '''渲染所属项目全局变量'''
    global_valuse = sql.Get_api_global(userid, api_belong_two)
    global_list = []
    for values in global_valuse:
        values_dict = OrderedDict()
        values_dict['key'] = values[1]
        values_dict['values'] = str(values[2])
        global_list.append(values_dict)
    response["global_valuse"] = global_list
    # print(response["global_valuse"])
    response['data_project'] = {}  # 返回所有项目和子模块的dict，渲染系统tree
    for num_project in project:
        data_project = []
        # print(num_project)
        # print(project[num_project])
        for i in project[num_project]:  # 渲染项目
            text1 = OrderedDict()
            text1['id'] = i[0]
            text1['projectname'] = i[1]
            text1['parentid'] = i[2]
            text1['level'] = [3]
            data_project.append(text1)
        response['data_project'][num_project] = data_project
    if To_Back(request):
        return redirect("/api-work")
    if request.POST.has_key('add_one'):
        '''
        替换全局变量
        '''
        if request.POST['api_mark']:
            api_mark = request.POST['api_mark']
            response['api_mark'] = api_mark
        if request.POST['api_type']:
            api_type = request.POST['api_type']
            response['api_type'] = api_type
        if request.POST['api_header']:
            api_header = request.POST['api_header']
            response['api_header'] = api_header
            for i in global_list:
                key = "!{" + i['key'] + "}"
                values = i['values']
                com = re.compile(key)
                api_header = re.sub(com, values, api_header, 0)
        if request.POST['api_url']:
            api_url = request.POST['api_url']
            response['api_url'] = api_url
        if request.POST['api_data']:
            api_data = request.POST['api_data']
            for i in global_list:
                key = "!{" + i['key'] + "}"
                values = i['values']
                com = re.compile(key)
                # print(key)
                api_data = re.sub(com, values, str(api_data), 0)
        if request.POST['api_level']:
            api_level = request.POST['api_level']
            response['api_level'] = api_level
        if request.POST['api_sql']:
            api_sql = request.POST['api_sql']
            response['api_sql'] = api_sql
        else:
            api_sql = " "
            response['api_sql'] = api_sql
        if request.POST['api_project']:
            api_project = request.POST['api_project']
            response['api_project'] = api_project
    if request.POST.has_key('excute'):
        if request.POST.has_key('excute'):
            try:
                print(api_data)
                api_respones = Api_Requests.api_excute(api_header, api_url, api_data, api_sql)
                '''
                捕获入参异常
                '''
            except BaseException, e:
                print("Error is    " + str(e))
                response['result'] = u"创建失败"
                response['msg'] = json.dumps("参数不能为空")
                return render(request, "add-api.html", response)
            response['api_respones'] = api_respones
            # print( response['api_respones'])
            # print("1111")
            return render(request, "add-api.html", response)
    # print("inter ")
    if request.POST.has_key('add_one'):
        if request.session.get('posttoken', '') == 'yes':
            # print("yes")
            # api_belong=str(recursive.get_father_project(api_project))
            api_belong = recursive()
            api_belong = str(api_belong.get_father_project(api_project))
            api_updataname = username
            # print(api_project, api_type, api_mark, api_header, api_url, api_data, api_updataname, api_level, api_belong)
            add = sql.Add_api(api_project, api_type, api_mark, api_header, api_url, api_data, api_updataname,
                              api_level, api_belong)
            if add[0]:
                del request.session['posttoken']
                response['result'] = u"创建成功"
                response['msg'] = json.dumps(add[1])
                # print(add[1])
                return render(request, "add-api.html", response)
            else:
                response['result'] = u"创建失败"
                response['msg'] = json.dumps(add[1])
                # print(add[1])
                return render(request, "add-api.html", response)
        else:
            return HttpResponse("请勿重复提交")
    if request.POST.has_key('add_new'):
        key = request.POST['key']
        value = request.POST['value']
        # print(new_key, value)
        add_global=sql.Add_global_variable(key, value,userid,api_belong_two)
        response['result'] = u"全局变量创建成功"
        response['msg'] = json.dumps(u"全局变量创建成功")
        print( response['msg'])
        return render(request, "add-api.html", response)
    return render(request, "add-api.html", response)
