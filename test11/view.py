# -*- coding: UTF-8 -*-
from django.http import HttpResponse
from django.shortcuts import render

def hello(request):
    context = {}
    context['hello'] = 'Hello sdweqwwqe!'
    return render(request, 'hello.html', context)