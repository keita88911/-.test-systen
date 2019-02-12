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
import json
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


@auth
def form_report(request):
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
    dict_project=porject_select()

    contenx['data_project'] = dict_project
    # print(id)

    if request.method == 'GET':
        contenx['data_project'] = dict_project
        # 分页查询
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
        result = sql.report_form(startdata, enddata, projectid) #渲染报表
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
                text1['day_bug'] = int(i[0])
                text1['day_bug_off'] = int(i[1])
                text1['creat_time'] = str(i[2])[0:10]
                text1['project_id'] = i[3]
                Data.append(text1)
        contenx['data'] = Data
        #渲染总报表
        data2=[]
        total=report_from_total(startdata, enddata, projectid)
        for i in total:
            if result:
                text1 = {}
                text1 = OrderedDict()
                text1['day_bug_during'] = int(i[0])
                text1['day_bug_off_during'] = int(i[1])
                text1['day_bug_wait_off_during_total'] = int(i[2])
                text1['day_bug_total'] = int(i[3])
                text1['projectname'] = i[4]
                data2.append(text1)
        contenx['data2'] = data2
    if To_Add(request):
        return redirect("/add-day-report")


    if request.method == "POST":
        if request.POST.has_key('search'):
            # print('search')
            startdata = request.POST['start']
            enddata = request.POST['end']
            projectid = request.POST['projectid']

            result = sql.report_form(startdata, enddata, projectid)


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
                    text1['day_bug'] = int(i[0])
                    text1['day_bug_off'] = int(i[1])
                    text1['creat_time'] = str(i[2])[0:10]
                    text1['project_id'] = i[3]
                    Data.append(text1)
            if request.POST['start']:
                contenx['startdata'] = request.POST['start']
            if request.POST['end']:
                contenx['enddata'] = request.POST['end']
            if request.POST['projectid']:
                contenx['projectid'] = request.POST['projectid']
            contenx['data'] = Data

            total = report_from_total(startdata, enddata, projectid)
            data2=[]
            for i in total:
                if result:
                    text1 = {}
                    text1 = OrderedDict()
                    text1['day_bug_during'] = int(i[0])
                    text1['day_bug_off_during'] = int(i[1])
                    text1['day_bug_wait_off_during_total'] = int(i[2])
                    text1['day_bug_total'] = int(i[3])
                    text1['projectname'] = i[4]
                    data2.append(text1)
            contenx['data2'] = data2
            # 图形数据
            if projectid:

                graph_result =graph_report( projectid,startdata, enddata) #图形数据
                contenx['day_bug_graph'] = json.dumps(graph_result[0])
                contenx['day_bug_off_day_bug_graph'] = json.dumps(graph_result[1])
                contenx['day_bug_creat_time'] = json.dumps(graph_result[2])
                # print(contenx['day_bug_off_day_bug_graph'])
                # print( contenx['day_bug_creat_time'])
                contenx['project_id_js'] =json.dumps(projectid)
                contenx['project_id'] = projectid
                projectid_name = sql.Search_project_name(projectid)
                contenx['projectid_name'] = projectid_name[0][0]
            contenx['data_project'] = dict_project
            return render(request, "report-form.html", contenx)
        if request.POST.has_key('detail'):
            # id=request.POST['id_data']
            # workid=request.POST.getlist('workid', '')
            # request.session['posttoken'] = 'yes'
            day_reportid = request.POST['day_reportid']
            print(day_reportid)
            response = HttpResponseRedirect('/detail-day-report')
            request.session['day_reportid'] = day_reportid

            return response
            # print reportid

    return render(request, "report-form.html", contenx)

    '''总报表'''
def report_from_total(startdata=None, enddata=None, projectid=None):
    if not startdata:
        startdata = None
    if not enddata:
        enddata = None
    if not projectid:
        projectid = None
    from_total=sql.report_form_total(startdata, enddata, projectid)
    return from_total

'''图形报表'''
def graph_report( projectid,startdata=None, enddata=None):
    if not startdata:
        startdata = None
    if not enddata:
        enddata = None
    graph_report=sql.graph_report_form(projectid,startdata, enddata, )
    day_bug_graph = []
    day_bug_off_day_bug_graph = []
    day_bug_creat_time = []
    for i in graph_report:
        if graph_report:
            text1 = {}
            text1 = OrderedDict()
            text1['day_bug_graph'] = int(i[0])
            day_bug_graph.append(text1['day_bug_graph'])
            text1['day_bug_off_day_bug_graph'] = int(i[1])
            day_bug_off_day_bug_graph.append(text1['day_bug_off_day_bug_graph'])
            text1['day_bug_creat_time'] = str(i[2])[0:10]
            day_bug_creat_time.append(text1['day_bug_creat_time'])
    return day_bug_graph,day_bug_off_day_bug_graph,day_bug_creat_time

def porject_select():
    '''渲染项目插件查询'''
    project = sql.Search_main_project()
    data_project = []
    dict_project={}
    for i in project:
        text1 = OrderedDict()
        text1['id'] = i[0]
        text1['projectname'] = i[1]
        text1['parentid'] = i[2]
        text1['level'] = [3]
        data_project.append(text1)
    dict_project = data_project
    return dict_project