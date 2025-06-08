from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Department, Employee, Position
from api.serializers import EmployeeSerializer, DepartmentSerializer, DepartmentEmployeesSerializer, PositionSerializer


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


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    @action(detail=True)
    def employees(self, request, pk=None):
        department = self.get_object()

        return Response(DepartmentEmployeesSerializer(department).data.get('employees'))


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

