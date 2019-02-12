# -*- coding: utf-8 -*-
from DataBase import sql
from datetime import datetime
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect,HttpResponseRedirect
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from  collections  import OrderedDict
from common.To_add import To_Add
import MySQLdb
import os
import StringIO
from django.http import HttpResponse
from xlwt import *
import xlrd
from login import auth
import json
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

@auth
# 接收POST请求数据
def Borrow_Phone(request):
    request.coding = "utf-8"
    ctx = {'tips': "暂无数据", }
    text={'id':'',"userid":'','text':'','creatData':''}
    response={}
    response['roleid']=request.session.get('roleid')
    print(response['roleid'])

    userid = request.session.get('userid', '')
    roleid=request.session.get('roleid', '')
    # print(id)

    result = sql.Borrow_Phone()
    Data=[]
    # print(result)
    for i in result:
        if result:
            text1={}
            text1 = OrderedDict()
            text1['id'] =i[0]
            text1['phonename'] = i[1]
            text1['phonecode'] = i[2]
            text1['state'] = i[3]  #借出状态1:空闲2:借出
            text1['borrowname'] = i[4]
            text1['returnname'] = i[5]
            text1['detatime'] = str(i[6])[0:16]
            text1['phonemark'] = i[7]
            Data.append(text1)
    response['data']=Data
    response['result']=''
    # print(response['data'][0]['id'])
    if request.method == "POST":
        if request.POST.has_key('add'):
            request.session['posttoken'] = 'yes'
            return redirect("/add-phone")
    # if request.method == "POST":
    #     if request.POST.has_key('add'):
    #         return redirect("/add")
    if request.POST.has_key('return_phone'):
        returnname = request.session.get('username', '')
        phontid=request.POST['phoneid']
        remark=request.POST['remark']
        if  not remark:
            remark = '--'
        result=sql.Return_Phone(returnname,phontid,remark)
        if result:
            response['result']="操作成功"
            response['msg'] = json.dumps(u"归还成功")
            return render(request, "borrow-phone.html", response)
        else:
            response['result'] = "操作失败"
            response['msg'] = json.dumps(u"操作失败")
            return render(request, "borrow-phone.html", response)
    if request.POST.has_key('borrow'):
        phontid = request.POST['phoneid']
        remark=request.POST['remark']
        if  not remark:
            remark='--'
        borrowname=request.session.get('username','')
        result = sql.Borrow(borrowname,phontid,remark)
        if result:
            response['result'] = "操作成功"
            response['msg'] = json.dumps(u"借出成功")
            return render(request, "borrow-phone.html", response)
        else:
            response['result'] = "操作失败"
            response['msg'] = json.dumps(u"借出失败")
            return render(request, "borrow-phone.html", response)
    if request.method == "POST":
        if request.POST.has_key('search'):

            phonename = request.POST['person']
            start=request.POST['start']
            end=request.POST['end']
            borrow_state=request.POST['borrow_state']
            result = sql.Searchphone(phonename,start,end,borrow_state)
            Data = []
            response = {}
            # 默认查询条件
            if phonename:
                response['phonename']=phonename
                # print( "111")
            if start:
                response['startdata'] = start
            if end:
                response['enddata'] = end
            if borrow_state:
                response['borrow_state'] = borrow_state

            for i in result:
                if result:
                    text1 = {}
                    text1 = OrderedDict()
                    text1['id'] = i[0]
                    text1['phonename'] = i[1]
                    text1['phonecode'] = i[2]
                    text1['state'] = i[3]  # 借出状态1:空闲2:借出
                    text1['borrowname'] = i[4]
                    text1['returnname'] = i[5]
                    text1['detatime'] = str(i[6])[0:16]
                    text1['phonemark'] = i[7]
                    Data.append(text1)

            response['data'] = Data
            response['roleid'] = request.session.get('roleid')
            # print(response)
            return render(request, "borrow-phone.html", response)

        # if request.POST.has_key('delete'):
        #     id = request.POST['userid-person']
        #     final = sql.Delete_Person(id)
        #     response['result']=u'删除成功'
        #     print( response['result'])
        #     return render(request, "borrow-phone.html", response)
        if request.POST.has_key('all_delete'):
            try:
                check_box_list=request.POST.getlist('check_box_list')
                print(check_box_list)
                final = sql.Delete_Phone(check_box_list)
                response['result'] = u'删除成功'
                # print(11)
            except:
                # print(22)
                response['result'] = u'删除失败'
            print(response['result'])
            return render(request, "borrow-phone.html", response)
    # print(response['result']+"11begin")
    return render(request, "borrow-phone.html", response)
