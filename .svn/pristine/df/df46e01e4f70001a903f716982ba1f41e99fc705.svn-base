# -*- coding: UTF-8 -*-
from django.conf.urls import url
from django.conf.urls import url,include


from . import view, search2, login, week_report, add, index_1, \
    detail,personal_management,add_person,detail_person,borrow_phone,add_phone,password_updata,api_work,add_api,day_report,add_day_report,detail_day_report,report_form

from api.api_login import api_login
from django.conf.urls import url
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.conf import settings
from django.views.static import serve
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import staticfiles



import  sys
default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
    reload(sys)
    sys.setdefaultencoding(default_encoding)
#
# # 路由
# router = routers.DefaultRouter()
# router.register(r'users',views.UserViewSet,base_name='user')
# router.register(r'groups',views.GroupViewSet,base_name='group')
#
#
# # 重要的是如下三行
# from rest_framework.schemas import get_schema_view
# from rest_framework_swagger.renderers import SwaggerUIRenderer, OpenAPIRenderer
# schema_view = get_schema_view(title='Users API', renderer_classes=[OpenAPIRenderer, SwaggerUIRenderer])



var = ("test11 URL Configuration\n"
       "\n"
       "The `urlpatterns` list routes URLs to views. For more information please see:\n"
       "    https://docs.djangoproject.com/en/1.11/topics/http/urls/\n"
       "Examples:\n"
       "Function views\n"
       "    1. Add an import:  from my_app import views\n"
       "    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')\n"
       "Class-based views\n"
       "    1. Add an import:  from other_app.views import Home\n"
       "    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')\n"
       "Including another URLconf\n"
       "    1. Import the include() function: from django.conf.urls import url, include\n"
       "    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))\n")

urlpatterns = [

    url(r'^admin/', admin.site.urls),
    url(r'^hello$', view.hello),
    # url(r'^search-post$', search2.search_post),
    url(r'^register$', login.login),
    # url(r'^login$', login.login),
    url(r'^week-report$', week_report.SearchData),
    url(r'^index$', login.login),
    url(r'^add$', add.Add),
    url(r'^add-person$', add_person.Add_PerSon),
    url(r'^detail-person$', detail_person.Detail_Person),
    url(r'^index_1$', index_1.index_1),
    # url(r'^api/login$', api_login),
    url(r'^detail$', detail.Detail),
    url(r'^personal-management$', personal_management.PerSonNal),
    url(r'^borrow-phone$', borrow_phone.Borrow_Phone),
    url(r'^test$', search2.search_post),
    url(r'^add-phone$', add_phone.Add_Phone),
    url(r'^password-updata$', password_updata.Password_updata),
    url(r'^api-work$', api_work.Api_Work),
    url(r'^add-api', add_api.Add_Api),
    url(r'^day-report',day_report.search_day_report),
    url(r'^add-day-report', add_day_report.add_day_report),
    url(r'^detail-day-report$', detail_day_report.detail_day_report),
    url(r'^report-form$', report_form.form_report),


    # url(r'^user/', views.UserViewSet.as_view())
    # url(r'^docs/', schema_view, name="docs"),
    # url(r'^', include(router.urls)),
    # # drf登录
    # url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
    # # url(r'^house_list', week_report.SearchData),

    # url(r'^static/(?P<path>.*)$',serve,{'document_root': settings.STATIC_ROOT}),
]
urlpatterns += staticfiles_urlpatterns()
