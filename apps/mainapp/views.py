from django.shortcuts import render, redirect
from django.http import HttpResponse
# Create your views here.


# from .models import Test
def main(request): #메인 화면
    return render(request,'index.html')
# test 검증용
# def index(request):
#     tests = Test.objects.all()
#     return render(request, 'index1.html', {'tests': tests})
