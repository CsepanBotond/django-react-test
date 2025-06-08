from datetime import date, datetime, time
import json
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import serializers

from api.models import Appointment, Department, Employee, Position


def setup_db(cls):
    cls.employee_position = Position.objects.create(name='employee')
    cls.manager_position = Position.objects.create(name='manager')

    cls.first_dep = Department.objects.create(name='First Department')
    cls.second_dep = Department.objects.create(name='Second Department')

    cls.employees_data = [
        {
            'name': 'First Employee',
            'email': 'first@inc.com',
            'position': cls.employee_position,
            'department': cls.first_dep
        },
        {
            'name': 'Second Employee',
            'email': 'second@inc.com',
            'position': cls.employee_position,
            'department': cls.second_dep
        },
        {
            'name': 'Third Manager',
            'email': 'third@inc.com',
            'position': cls.manager_position,
            'department': cls.first_dep
        }
    ]

    cls.first_emp = Employee.objects.create(**cls.employees_data[0])
    cls.second_emp = Employee.objects.create(**cls.employees_data[1])
    cls.third_man = Employee.objects.create(**cls.employees_data[2])

    cls.second_dep.manager = cls.third_man
    cls.second_dep.save()

    def today_at(hour, minute=0):
        return datetime.combine(
            date=date.today(),
            time=time(
                hour=hour,
                minute=minute
            )
        )

    cls.appointments_data = [
        {
            'start': today_at(8),
            'end': today_at(8, 30),
            'title': 'First Appointment',
            'description': 'First Appointment Description',
        },
        {
            'start': today_at(9),
            'end': today_at(10),
            'title': 'Second Appointment',
            'description': 'Second Appointment Description'
        },
        {
            'start': today_at(14),
            'end': today_at(17, 30),
            'title': 'Third Appointment',
            'description': 'Third Appointment Description'
        }
    ]

    cls.first_app = Appointment.objects.create(**cls.appointments_data[0])
    cls.first_app = Appointment.objects.create(**cls.appointments_data[1])
    cls.first_app = Appointment.objects.create(**cls.appointments_data[2])
    pass


class EmployeeTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client_class = APIClient
        setup_db(cls)

    def test_create(self):
        name = 'New Employee'
        email = 'ne@inc.com'
        pos = 1
        dep = 2

        resp = self.client.post('/employees/', {
            'name': name,
            'email': email,
            'position': pos,
            'department': dep
        }, type='json')

        found = Employee.objects.get(name='New Employee')

        self.assertEqual(resp.status_code, 201)

        self.assertEqual(name, found.name)
        self.assertEqual(email, found.email)
        self.assertEqual(pos, found.position.pk)
        self.assertEqual(dep, found.department.pk)
        pass

    def test_retrieve(self):
        resp = self.client.get('/employees/')
        self.assertEqual(resp.status_code, 200)

        pass

    def test_retrieve_one(self):
        resp = self.client.get('/employees/1/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], Employee.objects.get(id=1).name)
        pass

    def test_retrieve_filtered(self):
        email = 'first@inc.com'
        resp1 = self.client.get(f'/employees/?email={email}')
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(
            resp1.json()[0]['name'], Employee.objects.filter(email=email).first().name)

        name = 'Second Employee'
        resp2 = self.client.get(f'/employees/?name={name}')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.json()[0]['name'], Employee.objects.filter(
            name=name).first().name)

        email = 'third@inc.com'
        name = 'Third Manager'
        resp3 = self.client.get(
            f'/employees/?email={email}&name={name}')

        self.assertEqual(resp3.status_code, 200)
        self.assertEqual(resp3.json()[0]['name'], Employee.objects.filter(
            name=name).filter(email=email).first().name)

        resp4 = self.client.get('/employees/?name=No Such')
        self.assertEqual(resp3.status_code, 200)
        self.assertEqual(resp4.json(), [])

        pass

    def test_update(self):
        resp = self.client.patch('/employees/1/', {
            'name': 'First Employee II',
            'position': 2
        }, type='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Employee.objects.get(
            id=1).position, self.manager_position)

        resp2 = self.client.put('/employees/2/', {
            'name': 'New Name',
            'email': 'new@inc.com',
            'position': 1,
            'department': 2,
        }, type='json')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual('New Name', Employee.objects.get(id=2).name)

        pass

    def test_destroy(self):
        resp = self.client.delete('/employees/1/')
        self.assertEqual(resp.status_code, 204)
        self.assertRaises(Employee.DoesNotExist,
                          lambda: Employee.objects.get(id=1))
        pass
    pass


class AppointmentTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.client_class = APIClient
        setup_db(cls)

    # def test_create(self):
    #     pass

    def test_retrieve(self):
        resp = self.client.get('/appointments/')
        self.assertEqual(resp.status_code, 200)
        print(resp.json())
        pass

    def test_retrieve_one(self):
        pass

    def test_update(self):
        resp = self.client.patch('/appointments/1/', {
            'participation': [
                {
                    'id': 1,
                },
                {
                    'id': 2
                }
            ],
            'employee': 3
        }, type='json')
        print(resp.status_code)
        resp2 = self.client.get("/appointments/1/")
        print(resp2.json())
        print(Appointment.objects.get(id=1).participation)
        pass

    def test_destroy(self):
        pass
    pass


class DepartmentTests(TestCase):
    def create(self):
        pass

    def retrieve(self):
        pass

    def retrieve_one(self):
        pass

    def update(self):
        pass

    def destroy(self):
        pass
    pass


class PositionTests(TestCase):
    def create(self):
        pass

    def retrieve(self):
        pass

    def retrieve_one(self):
        pass

    def update(self):
        pass

    def destroy(self):
        pass
    pass
