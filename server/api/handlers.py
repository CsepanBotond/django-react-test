from rest_framework.views import exception_handler

# Custom exception handling comes here. It doesn't do much yet, because most of
# the server code is declarative and it handles exception gracefully, and forwards
# them to the frontend in responses by default.
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code
    else:
        response.data['status_code'] = 500

    return response