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
def SearchData(request):
    # 接收POST请求数据
    request.coding = "utf-8"
    tt = time.time()
    ctx = {'tips': "暂无数据", }
    text = {'id': '', "userid": '', 'text': '', 'creatData': ''}
    # print(request.POST['id'])

    # print(request.POST['id'])
    # userid = request.COOKIES.get('userid', '')
    # roleid=request.COOKIES.get('roleid', '')

    userid = request.session.get('userid', '')
    roleid = request.session.get('roleid', '')

    # print(id)
    if request.method == 'GET':
        contenx = {}
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
        result = sql.SearchData(userid, roleid, person, startdata, enddata)
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
                if len( i[1])>10:
                    text1['title'] = i[1][0:10]+"...."
                else:
                    text1['title'] = i[1]
                text1['username'] = i[2]
                # print(text1['username'])
                # text1['userid'] = i[2]
                if  len(i[4])>100:
                    text1['text'] = i[4][0:100] + "....."
                else:
                    text1['text'] = i[4]
                # text1['creatData'] =dateTime.i[5].ToShortDateString().ToString()
                # print(i[5])
                text1['creatData'] = str(i[5])[0:10]
                # text1['creatData']
                # print(text1)
                Data.append(text1)

        contenx['data'] = Data
    if To_Add(request):
        return redirect("/add")
    # if request.method == "POST":
    #     if request.POST.has_key('add'):
    #         return redirect("/add")

    if request.method == "POST":
        if request.POST.has_key('search'):
            # print('search')
            person = request.POST['person']
            startdata = request.POST['start']
            enddata = request.POST['end']
            # print("start")
            result = sql.SearchData(userid, roleid, person, startdata, enddata, )
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
                    text1['title'] = i[1]
                    text1['username'] = i[2]
                    # text1['userid'] = i[2]
                    text1['text'] = i[4][0:100] + "...."
                    text1['creatData'] = str(i[5])[0:10]
                    # print(text1)
                    Data.append(text1)
            if request.POST['person']:
                contenx['person'] = request.POST['person']
            if request.POST['start']:
                contenx['startdata'] = request.POST['start']
            if request.POST['end']:
                contenx['enddata'] = request.POST['end']
            contenx['data'] = Data

            return render(request, "week-report.html", contenx)
        if request.POST.has_key('detail'):
            # id=request.POST['id_data']
            # workid=request.POST.getlist('workid', '')
            # request.session['posttoken'] = 'yes'
            reportid = request.POST['workid']
            response = HttpResponseRedirect('/detail')
            request.session['reportid'] = reportid

            return response
            # print reportid

    print('Time used: {} sec'.format(time.time() - tt))
    return render(request, "week-report.html", contenx)
