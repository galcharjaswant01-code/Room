from django.urls import path
from .views import OwnerDashboardView, AdminDashboardView

urlpatterns = [
    path('owner/', OwnerDashboardView.as_view(), name='owner_dashboard'),
    path('admin/', AdminDashboardView.as_view(), name='admin_dashboard'),
]
