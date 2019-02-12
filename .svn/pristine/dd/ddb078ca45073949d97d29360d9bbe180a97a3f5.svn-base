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
from django.core.files.base import ContentFile
from login import auth
import json

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


@auth
# 接收POST请求数据
def PerSonNal(request):
    request.coding = "utf-8"
    ctx = {'tips': "暂无数据", }
    text = {'id': '', "userid": '', 'text': '', 'creatData': ''}
    # print(request.POST['id'])

    # print(request.POST['id'])
    userid = request.session.get('userid', '')
    roleid = request.session.get('roleid', '')
    # print(id)
    if roleid:
        # print(roleid)
        result = sql.PerSonNal(roleid)
        Data = []
        # print(result)
        for i in result:
            if result:
                text1 = {}
                text1 = OrderedDict()
                text1['id'] = i[0]
                text1['username'] = i[1]
                if i[3] == str(1):
                    text1['roledid'] = "管理员"
                elif i[3] == str(2):
                    text1['roledid'] = "普通人员"
                Data.append(text1)
        response = {}
        response['data'] = Data
    if request.method == "POST":
        if request.POST.has_key('add'):
            request.session['posttoken'] = 'yes'
            return redirect("/add-person")
    # if request.method == "POST":
    #     if request.POST.has_key('add'):
    #         return redirect("/add")
    # 查询
    if request.method == "POST":
        if request.POST.has_key('search'):
            username = request.POST['username']

            result = sql.SearchPerSon(username)
            Data = []
            response = {}

            for i in result:
                if result:
                    text1 = {}
                    text1 = OrderedDict()
                    text1['id'] = i[0]
                    text1['username'] = i[1]
                    if i[3] == str(1):
                        text1['roledid'] = "管理员"
                    elif i[3] == str(2):
                        text1['roledid'] = "普通人员"

                    # print(text1)
                    Data.append(text1)

            response['data'] = Data
        # 详情
        if request.POST.has_key('detail'):
            # id=request.POST['id_data']
            # workid=request.POST.getlist('workid', '')

            id = request.POST['userid-person']

            # print(id)
            response = HttpResponseRedirect('/detail-person')

            request.session['userid_person'] = id

            return response
            # print reportid
        # 删除
        if request.POST.has_key('delete'):
            id = request.POST['userid-person']

            final = sql.Delete_Person(id)
            response['result'] = u'删除成功'
            # print( response['result'])
            return render(request, "personal-management.html", response)
        # 导出
        if request.POST.has_key('export'):
            list_obj = sql.PerSonNal_export()
            # print(list_obj)
            if list_obj:
                # 创建工作薄
                ws = Workbook(encoding='utf-8')
                w = ws.add_sheet(u"数据报表第一页")
                w.write(0, 0, "id")
                w.write(0, 1, u"用户名")
                w.write(0, 2, u"密码")
                w.write(0, 3, u"职位")
                # w.write(0, 4, u"来源")
                # 写入数据
                excel_row = 1
                for obj in list_obj:
                    data_id = obj[0]
                    data_user = obj[1]
                    data_password = obj[2]
                    data_content = obj[3]
                    if data_content == "1":
                        data_content = "管理员"
                    elif data_content == "2":
                        data_content = "普通人员"
                    # dada_source = obj.source
                    w.write(excel_row, 0, data_id)
                    w.write(excel_row, 1, data_user)
                    w.write(excel_row, 2, data_password)
                    w.write(excel_row, 3, data_content)
                    # w.write(excel_row, 4, dada_source)
                    excel_row += 1
                # 检测文件是够存在
                # 方框中代码是保存本地文件使用，如不需要请删除该代码
                ###########################
                exist_file = os.path.exists("test.xls")
                if exist_file:
                    os.remove(r"test.xls")
                ws.save("test.xls")
                ############################
                sio = StringIO.StringIO()
                ws.save(sio)
                sio.seek(0)
                response = HttpResponse(sio.getvalue(), content_type='application/vnd.ms-excel')
                response['Content-Disposition'] = 'attachment; filename=test.xls'
                response.write(sio.getvalue())
                return response
        # 导入用户
        if request.POST.has_key('import'):
            try:
                # print(os.path)
                obj = request.FILES.get('theFile')
                # photo = request.FILES["theFile"]
                # print(obj)
                # if not obj:
                #     return HttpResponse("no files for upload!")
                # print(obj)
                # print obj.name
                f = open(os.path.join('upload', obj.name), 'wb')
                for line in obj.chunks():
                    f.write(line)
                f.close()
                # return HttpResponse('上传成功')
                text = []
                book = xlrd.open_workbook(os.path.join('upload', obj.name))
                sheet = book.sheet_by_name("Sheet1")
                for r in range(1, sheet.nrows):
                    username1 = str(sheet.cell(r, 0).value)
                    password =str( sheet.cell(r, 1).value)
                    if sheet.cell(r, 2).value == "管理员":
                        roleid = 1
                    if sheet.cell(r, 2).value == "普通人员":
                        roleid = 2
                    # print(u'开始导入')
                    import_results = sql.PerSonNal_import(username1, password, roleid)
                    # print(import_results)
                    if import_results[0]:
                        text1 = OrderedDict()
                        # print(    text.append(import_results[1]))
                        print(text)
                        text.append(import_results[1] + "\n")
                        # response['msg']=text
                    else:
                        # print(    text.append(import_results[1]))
                        text.append(import_results[1] + "\n")

                        # response['msg']='导入失败'
                response['result_import'] = '导入完成'
                response['data'] = json.dumps(text)

                return render(request, "personal-management.html", response)
            except:

                return HttpResponse(u'请先选择导入excel文件')
        # 批量删除
        if request.POST.has_key('all_delete'):
            # print(u'进入批量删除')
            try:
                check_box_list = request.POST.getlist('check_box_list')
                # print(check_box_list)
                final = sql.Delete_Person(check_box_list)
                response['result'] = u'删除成功'
                # print(122)
                # print( response['result'])
            except:
                response['result'] = u'删除失败'
                # print("11")
            return render(request, "personal-management.html", response)
        # 下载模板
        if request.POST.has_key('download'):
            file = open('files/test.xls', 'rb')
            response = HttpResponse(file)
            response['Content-Type'] = 'application/octet-stream'  # 设置头信息，告诉浏览器这是个文件
            response['Content-Disposition'] = 'attachment;filename="导入模板.xls"'
            return response
    return render(request, "personal-management.html", response)
