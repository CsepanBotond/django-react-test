from django.shortcuts import render
from rest_framework import viewsets

from api.models import Employee
from api.serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        '''Allow filtering on `name` and `email` fields'''
        queryset = Employee.objects.all()
        email = self.request.query_params.get('email')
        name = self.request.query_params.get('name')
        if email is not None:
            queryset = queryset.filter(email=email)
        if name is not None:
            queryset = queryset.filter(name=name)

        return queryset
