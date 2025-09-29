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

class TipoEjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEjercicio
        fields = '__all__'

class EjercicioRutinaSerializer(serializers.ModelSerializer):
    nombre_ejercicio = serializers.SerializerMethodField()

    class Meta:
        model = EjercicioRutina
        fields = ['id', 'rutina', 'tipo_ejercicio', 'nombre_ejercicio', 'sets', 'repeticiones', 
                  'record_peso', 'orden']

    def get_nombre_ejercicio(self, obj):
        return obj.tipo_ejercicio.nombre

class RutinaSerializer(serializers.ModelSerializer):
    DIA_CHOICES = [
        ('lunes', 'Lunes'),
        ('martes', 'Martes'),
        ('miércoles', 'Miércoles'),
        ('jueves', 'Jueves'),
        ('viernes', 'Viernes'),
        ('sábado', 'Sábado'),
        ('domingo', 'Domingo'),
    ]

    dia = serializers.ChoiceField(choices=DIA_CHOICES)
    ejercicios = EjercicioRutinaSerializer(many=True, read_only=True)

    class Meta:
        model = Rutina
        fields = ['id', 'usuario', 'nombre', 'dia', 'ejercicios']
        read_only_fields = ['id']

class AmistadSerializer(serializers.ModelSerializer):
    amigo_username = serializers.CharField(source="amigo.username", read_only=True)
    amigo_email = serializers.EmailField(source="amigo.email", read_only=True)
    usuario_username = serializers.CharField(source="usuario.username", read_only=True)
    usuario_email = serializers.EmailField(source="usuario.email", read_only=True)
    tipo = serializers.SerializerMethodField()
    
    # Este campo solo se usa para input, no pertenece al modelo
    amigo_input = serializers.CharField(write_only=True)

    class Meta:
        model = Amistad
        fields = [
            "id",
            "usuario",
            "usuario_username",
            "usuario_email",
            "amigo",
            "amigo_username",
            "amigo_email",
            "status",
            "tipo",
            "amigo_input",
        ]
        read_only_fields = ['id', 'usuario', 'status', 'amigo']

    def get_tipo(self, obj):
        """Indica si la amistad fue enviada o recibida respecto al usuario logueado"""
        request = self.context.get("request")
        if request and obj.usuario == request.user:
            return "enviada"
        return "recibida"

    def create(self, validated_data):
        # Sacamos amigo_input
        amigo_input = validated_data.pop("amigo_input")
        usuario = self.context['request'].user

        from django.contrib.auth import get_user_model
        User = get_user_model()

        # Buscar por username o email
        try:
            amigo_user = User.objects.get(username=amigo_input)
        except User.DoesNotExist:
            try:
                amigo_user = User.objects.get(email=amigo_input)
            except User.DoesNotExist:
                raise serializers.ValidationError({"amigo_input": "Usuario no encontrado."})

        if usuario == amigo_user:
            raise serializers.ValidationError("No puedes agregarte a ti mismo como amigo.")

        validated_data['amigo'] = amigo_user
        validated_data['usuario'] = usuario
        validated_data['status'] = 'pendiente'

        return super().create(validated_data)

class PublicacionSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    usuario = serializers.ReadOnlyField(source='usuario.username')
    liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Publicacion
        fields = ['id', 'usuario', 'contenido', 'tipo', 'fecha_creacion', 'likes_count', 'liked_by_user']

    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_liked_by_user(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.likes.filter(usuario=user).exists()
        return False

class LikeSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source='usuario.username')
    publicacion = serializers.ReadOnlyField(source='publicacion.id')

    class Meta:
        model = Like
        fields = ['id', 'usuario', 'publicacion']