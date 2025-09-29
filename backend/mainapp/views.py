
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import AmistadSerializer, EjercicioRutinaSerializer, PublicacionSerializer, RegistroSerializer, UsuarioSerializer, RutinaSerializer, TipoEjercicioSerializer, LikeSerializer
from .models import Amistad, EjercicioRutina, Like, Publicacion, Usuario, Rutina, TipoEjercicio
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied


class RegistroView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistroSerializer

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logout exitoso"}, status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response({"error": "refresh token no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "token inválido o expirado"}, status=status.HTTP_400_BAD_REQUEST)
        
class UsuarioListView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class UsuarioDetailView(generics.RetrieveAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

class UsuarioMeView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class RutinaListCreateView(generics.ListCreateAPIView):
    serializer_class = RutinaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rutina.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class RutinaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RutinaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Rutina.objects.filter(usuario=self.request.user)
    
class TipoEjercicioListCreateView(generics.ListCreateAPIView):
    queryset = TipoEjercicio.objects.all()
    serializer_class = TipoEjercicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class TipoEjercicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TipoEjercicio.objects.all()
    serializer_class = TipoEjercicioSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class EjercicioRutinaListCreateView(generics.ListCreateAPIView):
    serializer_class = EjercicioRutinaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EjercicioRutina.objects.filter(rutina__usuario=self.request.user)
    
    def perform_create(self, serializer):
        rutina = serializer.validated_data['rutina']
        if rutina.usuario != self.request.user:
            raise PermissionDenied("No puedes añadir ejercicios a una rutina que no es tuya")
        serializer.save()

class EjercicioRutinaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EjercicioRutinaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EjercicioRutina.objects.filter(rutina__usuario=self.request.user)
    
class ReorderEjerciciosView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, rutina_id):
        rutina = Rutina.objects.filter(id=rutina_id, usuario=request.user).first()
        if not rutina:
            return Response({"error": "Rutina no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        ejercicios_data = request.data.get("ejercicios", [])
        if not isinstance(ejercicios_data, list):
            return Response({"error": "Formato inválido"}, status=status.HTTP_400_BAD_REQUEST)

        # Actualizamos el orden
        for e in ejercicios_data:
            try:
                ejercicio = EjercicioRutina.objects.get(id=e["id"], rutina=rutina)
                ejercicio.orden = e["orden"]
                ejercicio.save()
            except EjercicioRutina.DoesNotExist:
                continue

        return Response({"status": "ok"})

class AmistadListView(generics.ListAPIView):
    serializer_class = AmistadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Amistad.objects.filter(
            Q(usuario=user) | Q(amigo=user)
        )

class AmistadCreateView(generics.CreateAPIView):
    serializer_class = AmistadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user, status='pendiente')

class AmistadUpdateView(generics.UpdateAPIView):
    serializer_class = AmistadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo puede actualizar su propia amistad (ser amigo)
        return Amistad.objects.filter(amigo=self.request.user)

    def update(self, request, *args, **kwargs):
        instancia = self.get_object()

        if instancia.status != "pendiente":
            return Response(
                {"error": "La solicitud ya fue procesada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        nuevo_status = request.data.get('status')
        if nuevo_status not in ['aceptada', 'rechazada']:
            return Response(
                {"error": "Estado inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        instancia.status = nuevo_status
        instancia.save()
        return Response(self.get_serializer(instancia).data)

class AmistadDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Puede eliminar la amistad si es el solicitante o el amigo
        return Amistad.objects.filter(Q(usuario=user) | Q(amigo=user)) #Q es una forma de hacer consultas de bases de datos, aqui para un or

class PublicacionListCreateView(generics.ListCreateAPIView):
    queryset = Publicacion.objects.all().order_by('-fecha_creacion')
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class PublicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Publicacion.objects.all()
    serializer_class = PublicacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Opcional: solo permitir modificar/eliminar publicaciones propias
        return self.queryset.filter(usuario=self.request.user)
    
class LikeCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, publicacion_id):
        publicacion = Publicacion.objects.filter(id=publicacion_id).first()
        if not publicacion:
            return Response({'detail': 'Publicación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

        like, created = Like.objects.get_or_create(usuario=request.user, publicacion=publicacion)
        if created:
            serializer = LikeSerializer(like)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'detail': 'Ya le diste like'}, status=status.HTTP_200_OK)
        
class LikeDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, publicacion_id):
        like = Like.objects.filter(usuario=request.user, publicacion_id=publicacion_id).first()
        if like:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'detail': 'Like no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
