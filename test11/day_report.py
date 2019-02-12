# -*- coding: utf-8 -*-
from DataBase import sql
from datetime import datetime
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect, HttpResponseRedirect
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
from django.core.paginator import Paginator
import sys
from collections import OrderedDict
from common.To_add import To_Add
import MySQLdb
from common.To_Paginator import Pagdepart
from login import auth
# from numba import jit
import time

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


@auth
def search_day_report(request):
    # 接收POST请求数据
    request.coding = "utf-8"
    tt = time.time()
    ctx = {'tips': "暂无数据", }
    text = {'id': '', "userid": '', 'text': '', 'creatData': ''}
    # print(request.POST['id'])

    # print(request.POST['id'])
    # userid = request.COOKIES.get('userid', '')
    # roleid=request.COOKIES.get('roleid', '')
    contenx = {}
    userid = request.session.get('userid', '')
    roleid = request.session.get('roleid', '')
    '''渲染项目查询'''
    project = sql.Search_main_project()
    data_project = []
    for i in project:
        text1 = OrderedDict()
        text1['id'] = i[0]
        text1['projectname'] = i[1]
        text1['parentid'] = i[2]
        text1['level'] = [3]
        data_project.append(text1)
    contenx['data_project'] = data_project
    # print(id)
    if request.method == 'GET':

        # 分页查询
        person = request.GET.get('person', '')
        if person:
            contenx['person'] = request.GET.get('person')
        startdata = request.GET.get('start', '')
        if startdata:
            contenx['startdata'] = request.GET.get('start')
        enddata = request.GET.get('end', '')
        if enddata:
            contenx['enddata'] = request.GET.get('end')
        projectid = request.GET.get('projectid', '')
        if projectid:
            contenx['projectid'] = request.GET.get('projectid')
        # print(roleid + "sssssss")
        result = sql.Search_day_data(userid, roleid, person, startdata, enddata, projectid)
        page_num = request.GET.get('page', 1)
        paginator = Paginator(result, 10)
        # print(page_num)
        # print(paginator.count)
        page_of_blogs = paginator.page(int(page_num))  # get_page方法处理用户输入的错误值
        # print(type(page_of_blogs))
        current_page_num = page_of_blogs.number  # 获得当前页
        # 比较截取到想要的那个数到最小值1时用小的值和1作比较生成一个从小到当前的值
        range_page = list(range(max(current_page_num - 2, 1), current_page_num)) + \
                     list(range(current_page_num, min(current_page_num + 2, paginator.num_pages) + 1))
        if range_page[0] - 1 >= 2:
            range_page.insert(0, '...')
        if paginator.num_pages - range_page[-1] >= 2:
            range_page.append('...')
        # 添加首页和尾页
        if range_page[0] != 1:
            range_page.insert(0, 1)
        if range_page[-1] != paginator.num_pages:
            range_page.append(paginator.num_pages)

        contenx['page_of_blogs'] = page_of_blogs
        contenx['blogs'] = page_of_blogs.object_list  # 获取符合参数所有的文章
        # contenx['count'] = Blog.objects.all().count()
        contenx['range_page'] = range_page
        # print(paginator.object_list)
        #
        Data = []
        for i in page_of_blogs.object_list:
            if result:
                text1 = {}
                text1 = OrderedDict()
                text1['id'] = i[0]
                text1['userid'] = i[1]
                text1['username'] = i[2]
                text1['day_bug'] = i[3]
                text1['day_bug_off'] = i[4]
                text1['creat_time'] = str(i[5])[0:10]
                text1['updata_time'] = str(i[6])[0:10]
                text1['project_id'] = i[7]
                Data.append(text1)

        contenx['data'] = Data

    if To_Add(request):
        return redirect("/add-day-report")
    # if request.method == "POST":
    #     if request.POST.has_key('add'):
    #         return redirect("/add")

    if request.method == "POST":
        if request.POST.has_key('search'):
            # print('search')
            person = request.POST['person']
            startdata = request.POST['start']
            enddata = request.POST['end']
            projectid = request.POST['projectid']
            # print("start")

            result = sql.Search_day_data(userid, roleid, person, startdata, enddata, projectid)
            # print("111")
            page_num = request.GET.get('page', 1)
            paginator = Pagdepart(result, page_num)
            page_of_blogs = paginator[0]
            range_page = paginator[1]
            contenx = {}
            contenx['page_of_blogs'] = page_of_blogs
            contenx['blogs'] = page_of_blogs.object_list  # 获取符合参数所有的文章
            # contenx['count'] = Blog.objects.all().count()
            contenx['range_page'] = range_page
            Data = []
            # print("end")
            for i in page_of_blogs.object_list:
                if result:
                    text1 = {}
                    text1 = OrderedDict()
                    text1['id'] = i[0]
                    text1['userid'] = i[1]
                    text1['username'] = i[2]
                    text1['day_bug'] = i[3]
                    text1['day_bug_off'] = i[4]
                    text1['creat_time'] = str(i[5])[0:10]
                    text1['updata_time'] = str(i[6])[0:10]
                    text1['project_id'] = i[7]
                    Data.append(text1)
            if request.POST['person']:
                contenx['person'] = request.POST['person']
            if request.POST['start']:
                contenx['startdata'] = request.POST['start']
            if request.POST['end']:
                contenx['enddata'] = request.POST['end']
            if request.POST['projectid']:
                contenx['projectid'] = request.POST['projectid']

            contenx['data'] = Data

            if projectid:
                contenx['project_id'] = projectid
                projectid_name = sql.Search_project_name(projectid)
                contenx['projectid_name'] = projectid_name[0][0]
            '''渲染项目查询'''
            project = sql.Search_main_project()
            data_project = []
            for i in project:
                text1 = OrderedDict()
                text1['id'] = i[0]
                text1['projectname'] = i[1]
                text1['parentid'] = i[2]
                text1['level'] = [3]
                data_project.append(text1)
            contenx['data_project'] = data_project
            return render(request, "day-report.html", contenx)
        if request.POST.has_key('detail'):
            # id=request.POST['id_data']
            # workid=request.POST.getlist('workid', '')
            # request.session['posttoken'] = 'yes'
            day_reportid = request.POST['day_reportid']
            response = HttpResponseRedirect('/detail-day-report')
            request.session['day_reportid'] = day_reportid
            return response
            # print reportid

    return render(request, "day-report.html", contenx)
