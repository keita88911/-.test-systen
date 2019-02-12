# -*- coding: utf-8 -*-

from django.shortcuts import render
from django.views.decorators import csrf


# 接收POST请求数据
def search_post(request):
    request.coding = "utf-8"
    ctx = {}
    check_box_list = request.POST.getlist('check_box_list')
    print(check_box_list)
    return render(request, "test.html", ctx)