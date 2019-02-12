
from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect
from django.views.decorators import csrf
from django.contrib.auth import authenticate, login, logout
import sys
from  collections  import OrderedDict

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)

def To_Add(request):
    if request.method == "POST":
        if request.POST.has_key('add'):
            request.session['posttoken']='yes'
            # print(request.session['posttoken'])
            return True
