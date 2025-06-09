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
        pos = self.employee_position.id
        dep = self.second_dep.id

        resp = self.client.post('/employees/', {
            'name': name,
            'email': email,
            'position': pos,
            'department': dep
        }, type='json')

        found = Employee.objects.all().filter(name='New Employee').first()

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
        resp = self.client.get(f'/employees/{self.first_emp.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], self.first_emp.name)
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
        first_id = self.first_emp.id
        resp = self.client.patch(f'/employees/{first_id}/', {
            'name': 'First Employee II',
            'position': self.manager_position.id,
        }, type='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(Employee.objects.get(
            id=first_id).position, self.manager_position)

        second_id = self.second_emp.id
        resp2 = self.client.put(f'/employees/{second_id}/', {
            'name': 'New Name',
            'email': 'new@inc.com',
            'position': self.employee_position.id,
            'department': self.second_dep.id,
        }, type='json')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual('New Name', Employee.objects.get(id=second_id).name)

        pass

    def test_destroy(self):
        id = self.first_emp.id
        resp = self.client.delete(f'/employees/{id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertRaises(Employee.DoesNotExist,
                          lambda: Employee.objects.get(id=id))
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
        pass

    def test_retrieve_one(self):
        pass

    def test_update(self):
        app_id = self.first_app.id
        resp = self.client.patch(f'/appointments/{app_id}/', {
            'participation': [
                self.first_emp.id,
                self.second_emp.id
            ],
            'employee': self.third_man.id
        }, type='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Appointment.objects.get(
            id=app_id).participation.contains(Employee.objects.get(id=self.first_emp.id)))
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
