#!usr/bin/python
# -*- coding: utf-8 -*-
from DataBase import sql
import requests
import json
import sys
import api



default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)


class Api_Requests():
    @classmethod
    def api_request(self,api_id):
        reuslt = sql.execute_api(api_id)
        print(reuslt)
        header=reuslt[4]
        url=reuslt[5]
        data=reuslt[6]
        headers =json.loads(header.decode('utf-8').replace("'", "\""))   #将string转换成dict# 读取接口相关信息
        url =url
        payload = json.loads(data.decode('utf-8').replace("'", "\""))
        data = json.dumps(payload)
        response = requests.request("POST", url, data=data, headers=headers,timeout=10)
        # r = requests.post(url,data=payload,headers= headers)
        response.text1 = json.loads(response.text)
        if  response.status_code==200:
            sql.result_api( "True",api_id)
            return  True
        else:
            sql.result_api("False", api_id)
            return False
    @classmethod
    def api_excute(self,api_header,api_url,api_data,api_sql=None):
        headers = json.loads(api_header.decode('utf-8').replace("'", "\""))  # 将string转换成dict# 读取接口相关信息
        payload = json.loads(api_data.decode('utf-8').replace("'", "\""))
        data = json.dumps(payload)
        response = requests.request("POST", api_url, data=data, headers=headers)
        # r = requests.post(url,data=payload,headers= headers)
        response.text1 = json.loads(response.text)
        # print( response.text)
        return response.text



