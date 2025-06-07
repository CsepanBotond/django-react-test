from django.db import models

# Varchar limits and "on delete" settings are guesswork, I'd ask for clarification on a real world project.
# And so are constraints (or lack thereof)

# Position has its designated table to make it easier to handle and more future-proof


class Position(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100)
    desctiption = models.CharField(max_length=200)
    manager = models.ForeignKey(
        'Employee', on_delete=models.SET_NULL, null=True, related_name="manages")

    def __str__(self):
        return self.name


class Employee(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    position = models.ForeignKey(
        Position, on_delete=models.SET_NULL, null=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    start = models.DateTimeField()
    end = models.DateTimeField()
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    # If I didn't write this over the weekend I'd ask for specification about this field, especially if it refers to the inititator/scheduler of the appointment.
    employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, related_name="appointed_to", null=True)
    # The mockup hints at the fact that multiple employees can participate in an appointment, hence the separate 'participation' assoc. table
    participation = models.ManyToManyField(Employee)

    def __str__(self):
        return self.title
