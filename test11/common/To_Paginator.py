# -*- coding: utf-8 -*-
from django.core.paginator import Paginator

def Pagdepart(result,page_num):
    paginator = Paginator(result, 10)

    # print(page_num)
    # print(paginator.count)
    try:
        page_of_blogs = paginator.page(int(page_num))  # get_page方法处理用户输入的错误值
    except:
        page_of_blogs = paginator.page(int(1))  # get_page方法处理用户输入的错误值
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
    # print(page_of_blogs.object_list)
    return page_of_blogs,range_page