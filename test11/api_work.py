# -*- coding: utf-8 -*-
from DataBase import sql
from datetime import datetime
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect, HttpResponseRedirect
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from collections import OrderedDict
from common.To_add import To_Add
import MySQLdb
import os
import StringIO
from django.http import HttpResponse
from xlwt import *
import xlrd
from login import auth
import json
import api_request

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


@auth
# 接收POST请求数据
def Api_Work(request):
    request.coding = "utf-8"
    ctx = {'tips': "暂无数据", }
    text = {'id': '', "userid": '', 'text': '', 'creatData': ''}
    response = {}
    response['roleid'] = request.session.get('roleid')
    # print(response['roleid'])
    # print(request.POST['id'])
    userid = request.session.get('userid', '')
    roleid = request.session.get('roleid', '')
    projectid=request.GET.get('projectid', '1')#默认部门ID
    # request.session['projectid']=projectid
    project=sql.Search_project() #读取所有项目分类排序

    # print(project)
    response['data_project']={} #返回所有项目和子模块的dict，渲染系统tree
    for num_project in project:
        data_project=[]
        # print(num_project)
        # print(project[num_project])
        for i in project[num_project]: #渲染项目
            text1 = OrderedDict()
            text1['id']=i[0]
            text1['projectname']=i[1]
            text1['parentid']=i[2]
            text1['level']=[3]
            data_project.append(text1)
        response['data_project'][num_project]=data_project

    if request.method=="GET":
        mark = request.GET.get('mark', '')
        type = request.GET.get('type')
        start =  request.GET.get('start')
        end =  request.GET.get('end')
        level = request.GET.get('level')
        project_total = sql.Search_project_total(projectid)#选中项目或者子模块,读取项目和子项目ID
        request.session['projectid']=project_total#查询部门ID的子查询
        result=sql.SearchApi(mark, start, end, level,type,project_total)
        Data = []
        # print(result)
        for i in result:
            if result:
                text1 = OrderedDict()
                text1['id'] = i[0]
                text1['projectsID'] = i[1]
                text1['type'] = i[2]
                text1['mark'] = i[3]
                text1['header'] = str(i[4])[0:15] + '...'
                text1['url'] = str(i[5])[0:30] + '...'
                text1['data'] = str(i[6])[0:15] + '...'
                # text1['detatime'] = str(i[6])[0:16]
                text1['sql'] = str(i[7])[0:15] + '...'
                text1['response'] = str(i[8])[0:15] + '...'
                text1['result'] = i[9]
                text1['updataname'] = i[10]
                text1['updatatime'] = str(i[11])[0:16]
                text1['level'] = i[12]
                text1['belong'] = i[13]
                Data.append(text1)
        response['data'] = Data
        print(  response['data'])
        response['result'] = ''
    if request.method == "POST":
        if request.POST.has_key('add'):
            request.session['posttoken'] = 'yes'
            request.session['projectid']= projectid

            return redirect("/add-api")
    # if request.method == "POST":
    #     if request.POST.has_key('add'):
    #         return redirect("/add")

    if request.method == "POST":
        if request.POST.has_key('search'):
            mark = request.POST['mark']
            type=request.POST['type']
            start = request.POST['start']
            end = request.POST['end']
            level = request.POST['level']
            porject_total_id=request.session['projectid']
            result = sql.SearchApi(mark, start, end, level,type,porject_total_id)
            Data = []
            # 默认查询条件
            if mark:
                response['phonename'] = mark
                # print( "111")
            if start:
                response['startdata'] = start
            if end:
                response['enddata'] = end
            if level:
                response['level'] = level
            for i in result:
                if result:
                    text1 = {}
                    text1 = OrderedDict()
                    text1['id'] = i[0]
                    text1['projectsID'] = i[1]
                    text1['type'] = i[2]
                    text1['mark'] = i[3]
                    text1['header'] = str(i[4])[0:15] + '...'
                    text1['url'] = str(i[5])[0:30] + '...'
                    text1['data'] = str(i[6])[0:15] + '...'
                    # text1['detatime'] = str(i[6])[0:16]
                    text1['sql'] = str(i[7])[0:15] + '...'
                    text1['response'] = str(i[8])[0:15] + '...'
                    text1['result'] = i[9]
                    text1['updataname'] = i[10]
                    text1['updatatime'] = str(i[11])[0:16]
                    text1['level'] = i[12]
                    text1['belong'] = i[13]
                    Data.append(text1)
            response['data'] = Data
            response['roleid'] = request.session.get('roleid')
            # print(response)
            return render(request, "api-work.html", response)
        # if request.POST.has_key('delete'):
        #     id = request.POST['userid-person']
        #     final = sql.Delete_Person(id)
        #     response['result']=u'删除成功'
        #     print( response['result'])
        #     return render(request, "borrow-phone.html", response)
        if request.POST.has_key('all_delete'):
            try:
                check_box_list = request.POST.getlist('check_box_list')
                print(check_box_list)
                final = sql.Delete_Phone(check_box_list)
                response['result'] = u'删除成功'
                # print(11)
            except:
                # print(22)
                response['result'] = u'删除失败'
            print(response['result'])
            return render(request, "api-work.html", response)
        # print(response['result']+"11begin")
        if request.POST.has_key('execute'):
            api_id = request.POST['api_id']
            if api_request.Api_Requests.api_request(api_id):
                response['result'] = "操作成功"
                response['msg'] = json.dumps(u"执行完成")
                return render(request, "api-work.html", response)
            else:
                response['result'] = "操作失败"
                response['msg'] = json.dumps(u"执行失败")
                return render(request, "api-work.html", response)
    return render(request, "api-work.html", response)
