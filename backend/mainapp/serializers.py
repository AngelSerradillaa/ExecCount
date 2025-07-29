from rest_framework import serializers
from .models import Amistad, Like, Publicacion, Usuario, Rutina, TipoEjercicio, EjercicioRutina
from django.contrib.auth.password_validation import validate_password

class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ('email', 'username','nombre', 'apellidos', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return Usuario.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            nombre=validated_data['nombre'],
            apellidos=validated_data['apellidos'],
            password=validated_data['password']
        )
    
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email', 'username', 'nombre', 'apellidos']
        read_only_fields = ['id', 'email', 'username']  

class RutinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rutina
        fields = ['id', 'nombre', 'descripcion', 'usuario']
        read_only_fields = ['id', 'usuario']

class TipoEjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEjercicio
        fields = '__all__'

class EjercicioRutinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EjercicioRutina
        fields = '__all__'

class AmistadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Amistad
        fields = ['id', 'usuario', 'amigo', 'status']
        read_only_fields = ['id', 'usuario', 'status']  

    def validate(self, data):
        if data['usuario'] == data['amigo']:
            raise serializers.ValidationError("No puedes agregarte a ti mismo como amigo.")
        return data

class PublicacionSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    usuario = serializers.ReadOnlyField(source='usuario.username')

    class Meta:
        model = Publicacion
        fields = ['id', 'usuario', 'contenido', 'tipo', 'fecha_creacion', 'likes_count']

    def get_likes_count(self, obj):
        return obj.likes.count()

class LikeSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    publicacion = serializers.ReadOnlyField(source='publicacion.id')

    class Meta:
        model = Like
        fields = ['id', 'usuario', 'publicacion']