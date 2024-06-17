from django.db import models

# DB모델
# Create your models here.

# test 테이블의 데이터를 잘 가져오는지 검증
class Test(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name