#-*- coding:utf-8 -*-

import sys
reload(sys)
sys.setdefaultencoding('utf8')
# a = {'id': '', 'name': ''}
# b = (('1', "xiangj"), ('2', 'lihao'))
# import operator
# from  collections  import OrderedDict
# c = {}
# d = []
# text1 = {}
# text1=OrderedDict()
# # text1['id'] =i[0]
# text1['title']= 1333
# text1['username'] = 33
# # text1['userid'] = 22
#
# text1['text'] = 2323
# text1['creatData'] = 123
# # sorted_x=sorted(text1.items(),key=operator.itemgetter(0))
#====================时间转换
# a="2018-11-06"
# b=datetime.datetime.strptime(a,"%Y-%m-%d")+datetime.timedelta(days=1)
# import datetime
# # stamp = datetime(2017, 10, 7)
# # str(stamp)
# # stamp=datetime(2017, 10, 7).strftime('%Y-%m-%d')
# stamp=("2018-11-22 16:34:57")[0:9]
# # for e in b:
# #     for key in a.keys():
# #         if key == 'id':
# #             c[key] = e[0]
# #         elif key == 'name':
# #             c[key] = e[1]
# #
# #     d.append(c)
# import xlrd
# print(stamp)
# class b():
#     @classmethod
#     def a(self):
#         return True
# if b.a():
#     print(11)
# # =====================================判断类型
# def a(ab):
#     print type(ab)
#     if type(ab).__name__ == 'list':
#         print("ab is list")
#     if ab==1:
#         msg="11"
#         return True,msg
#     else:
#         msg="22"
#         return False,msg
# list=[1,2,3,3,4]
# c=a(list)
# print(c)
#
def zhongwen():
    a="啊发发发"
    for ch in a.decode('utf-8'):
        if ch >= u'\u4e00' and ch <= u'\u9fa5':
            print("111")
    import xlrd

import xlrd
def getParams(file):
    # file = ""
    exce = xlrd.open_workbook(file)
    table = exce.sheet_by_name('Sheet1')
    method = table.cell(0, 0).value
    print(method)
a=getParams("E:\\test_xlrd.xlsx")