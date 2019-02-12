# -*- coding: UTF-8 -*-
import re
import os
import sys
sys.path.append("..")
from ..  import  DataBase
class recursive():
    '''取出最高级的项目父级ID'''
    def __init__(self):
        self.projecet = list(DataBase.sql.Search_all_project())
        # print(projecet)

    def get_father_project(self,id):
        # print(digui.prent_id)
        prent_id = DataBase.sql.Get_parentid(id)
        father_id = id
        id=prent_id

        # print(id)
        for i in   self.projecet:
            # print i[2],father_id
            if str(i[2])==str(0) and str(father_id)==str(i[0]):
                # print(str(i[0]) + "    test")
                return i[0]
            elif str(id)==str(i[0]):
                if i[2]==str(0):
                    # print(id+"    test")
                    return str(id)
                id=i[2]
                recursive.get_father_project(id)

# a=recursive.get_father_project(11)