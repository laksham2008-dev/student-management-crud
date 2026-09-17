from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeSettingsView, DepartmentViewSet, SetupView, LoginView, LogoutView, UserAccessViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'users', UserAccessViewSet, basename='user-access')

urlpatterns = [
    path('settings/', CollegeSettingsView.as_view(), name='college-settings'),
    path('setup/', SetupView.as_view(), name='setup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', include(router.urls)),
]