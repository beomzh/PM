from django.urls import path, include
from mainapp import views
app_name='mainapp'


# 변수로 설정한 값을 include함.
urlpatterns = [
    path('',views.main, name='main'),
    # path('test', views.index, name='index'), # test용
]
