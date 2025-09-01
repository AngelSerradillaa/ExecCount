from django.urls import path
from .views import ( AmistadCreateView, AmistadDeleteView, AmistadListView, AmistadUpdateView, 
                    EjercicioRutinaDetailView, EjercicioRutinaListCreateView, LikeCreateView, LikeDeleteView, PublicacionDetailView, PublicacionListCreateView, RegistroView, 
                    LogoutView, ReorderEjerciciosView, UsuarioListView, UsuarioDetailView, UsuarioMeView, 
                    RutinaListCreateView, RutinaDetailView, TipoEjercicioDetailView,
                    TipoEjercicioListCreateView  )
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('registro/', RegistroView.as_view(), name='registro'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('users/', UsuarioListView.as_view()),              
    path('users/me/', UsuarioMeView.as_view()),
    path('users/<int:pk>/', UsuarioDetailView.as_view()),

    path('rutinas/', RutinaListCreateView.as_view(), name='rutina-list-create'),
    path('rutinas/<int:pk>/', RutinaDetailView.as_view(), name='rutina-detail'),
    path('rutinas/<int:rutina_id>/reorder-ejercicios/', ReorderEjerciciosView.as_view(), name='reorder-ejercicios'),

    path('tipo-ejercicios/', TipoEjercicioListCreateView.as_view(), name='tipo_ejercicio_list_create'),
    path('tipo-ejercicios/<int:pk>/', TipoEjercicioDetailView.as_view(), name='tipo_ejercicio_detail'),

    path('ejercicio-rutinas/', EjercicioRutinaListCreateView.as_view(), name='ejercicio-rutina-list-create'),
    path('ejercicio-rutinas/<int:pk>/', EjercicioRutinaDetailView.as_view(), name='ejercicio-rutina-detail'),
    

    path('amistades/', AmistadListView.as_view(), name='amistad-list'),
    path('amistades/crear/', AmistadCreateView.as_view(), name='amistad-create'),
    path('amistades/<int:pk>/actualizar/', AmistadUpdateView.as_view(), name='amistad-update'),
    path('amistades/<int:pk>/eliminar/', AmistadDeleteView.as_view(), name='amistad-delete'),

    path('publicaciones/', PublicacionListCreateView.as_view(), name='lista_crear_publicaciones'),
    path('publicaciones/<int:pk>/', PublicacionDetailView.as_view(), name='detalle_publicacion'),

    path('publicaciones/<int:publicacion_id>/like/', LikeCreateView.as_view(), name='dar_like'),
    path('publicaciones/<int:publicacion_id>/unlike/', LikeDeleteView.as_view(), name='quitar_like'),
]