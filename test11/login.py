# -*- coding: utf-8 -*-
from DataBase import sql
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect,HttpResponseRedirect
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
import MySQLdb
import time
from django.db import transaction
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


# 登陆验证
def auth(func):

    def inner(request, *args, **kwargs):
        ck = request.session.get("username")
        '''如果没有登陆返回'''
        if not ck:
            return redirect("/index")
        return func(request, *args, **kwargs)
    return inner


# 接收POST请求数据
def login(request):
    tt = time.time()
    request.coding = "utf-8"
    ctx = {'result': "请登录", "final": "登录成功","id":""}
    if request.POST:
        result = sql.getsqldata(request.POST['username'], request.POST['password'])
        # if  not result:
        #     ctx['result']="登录成功"
        #     return render(request, "register.html", ctx)
        # print(result)
        # print(request.POST['username'])
        if result:
            if request.POST['username'] == result[1] and request.POST['password'] == result[2]:
                ctx['result'] = "登录成功"
                ctx['id']=result[0]
                ctx['username'] = result[1]
                ctx['roleid'] = result[3]
                # print(ctx['id'])
                # return redirect(request, "/hello")
                ''''
                传入id，用户名，权限
                '''
                response= HttpResponseRedirect('/index_1')
                # response.set_signed_cookie('userid',ctx['id'])
                # response.set_cookie( 'username', ctx['username'])
                # response.set_cookie('roleid', ctx['roleid'])
                request.session['userid']=ctx['id']
                request.session['username'] =  ctx['username']
                request.session['roleid'] = ctx['roleid']
                # print(ctx['id'])
                print('Time used: {} sec'.format(time.time() - tt))
                return response

        else:
            ctx['result'] = "账号密码错误"
            return render(request, "index.html", ctx)
    print('Time used: {} sec'.format(time.time() - tt))
    return render(request, "index.html", ctx)
    # ctx['finnall']="登录成功"

    # return render(request, "register.html", ctx)
    # print(result)
    #     if result== ctx['name']:
    #         return render(request, "register.html", ctx)
    # else:
    #     return render(request, "register.html", ctx)
