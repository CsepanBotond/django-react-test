from rest_framework import serializers

from api.models import Appointment, Department, Employee, Position

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class DepartmentEmployeesSerializer(serializers.ModelSerializer):
    employees = EmployeeSerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['employees']


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    participation = EmployeeSerializer(many=True, read_only=True)
    employee = EmployeeSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
