import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler to standardize all API error responses.
    Ensures clean JSON responses without leaking Python tracebacks to the client.
    """
    # Call REST framework's default exception handler first to get the standard response
    response = exception_handler(exc, context)

    # If an unexpected exception occurred that DRF didn't handle
    if response is None:
        if isinstance(exc, Http404):
            return Response(
                {
                    "success": False,
                    "error": "Student not found.",
                    "detail": "The requested student record does not exist."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        elif isinstance(exc, DjangoValidationError):
            # Convert Django model validation error to DRF 400 response
            return Response(
                {
                    "success": False,
                    "error": "Validation Error",
                    "details": exc.message_dict if hasattr(exc, 'message_dict') else [str(exc)]
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
            return Response(
                {
                    "success": False,
                    "error": "Internal Server Error",
                    "detail": "An unexpected error occurred on the server. Please try again later."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Standardize DRF handled error responses
    custom_data = {
        "success": False,
        "status_code": response.status_code,
    }

    if response.status_code == status.HTTP_404_NOT_FOUND:
        custom_data["error"] = "Not Found"
        custom_data["detail"] = response.data.get("detail", "The requested student resource was not found.")
    elif response.status_code == status.HTTP_400_BAD_REQUEST:
        custom_data["error"] = "Validation Error"
        custom_data["details"] = response.data
    else:
        custom_data["error"] = "Request Error"
        custom_data["details"] = response.data

    response.data = custom_data
    return response
