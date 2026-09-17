from rest_framework.permissions import BasePermission

from .models import CollegeSettings, UserAccess


def get_access(user):
    if not user or not user.is_authenticated:
        return None
    settings_obj = CollegeSettings.objects.first()
    if settings_obj and settings_obj.admin_user_id == user.id:
        return None
    return UserAccess.objects.filter(user=user).first()


def get_user_college(user):
    settings_obj = CollegeSettings.objects.filter(admin_user=user).first()
    if settings_obj:
        return settings_obj
    access = get_access(user)
    return access.college if access else None


class CollegeActionPermission(BasePermission):
    action_permission = {
        'list': 'can_view_students',
        'retrieve': 'can_view_students',
        'create': 'can_add_students',
        'update': 'can_edit_students',
        'partial_update': 'can_edit_students',
        'destroy': 'can_delete_students',
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or CollegeSettings.objects.filter(admin_user=request.user).exists() or UserAccess.objects.filter(user=request.user, role='admin').exists():
            return True
        access = get_access(request.user)
        permission_name = self.action_permission.get(getattr(view, 'action', None))
        return bool(access and permission_name and getattr(access, permission_name, False))


class DepartmentActionPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or CollegeSettings.objects.filter(admin_user=request.user).exists() or UserAccess.objects.filter(user=request.user, role='admin').exists():
            return True
        access = get_access(request.user)
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return bool(access and access.can_view_students)
        return bool(access and access.can_manage_departments)