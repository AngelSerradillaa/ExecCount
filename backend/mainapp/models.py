from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models

class UsuarioManager(BaseUserManager):
    def create_user(self, email, username, nombre, apellidos, password=None):
        if not email:
            raise ValueError('El usuario debe tener un email')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, nombre=nombre, apellidos=apellidos)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, nombre, apellidos, password):
        user = self.create_user(email, username, nombre, apellidos, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nombre = models.CharField(max_length=255)
    apellidos = models.CharField(max_length=255)
    username = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellidos', 'username']

    def __str__(self):
        return self.email
    
class Amistad(models.Model):
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='amistades_solicitadas')
    amigo = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='amistades_recibidas')
    status = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('aceptada', 'Aceptada'), ('rechazada', 'Rechazada')], default='pendiente')

    class Meta:
        unique_together = ('usuario', 'amigo')

    def __str__(self):
        return f"{self.usuario} -> {self.amigo} ({self.status})"


class Rutina(models.Model):
    DIAS_SEMANA = [
        ('LUN', 'Lunes'),
        ('MAR', 'Martes'),
        ('MIE', 'Miércoles'),
        ('JUE', 'Jueves'),
        ('VIE', 'Viernes'),
        ('SAB', 'Sábado'),
        ('DOM', 'Domingo'),
    ]

    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE, related_name='rutinas')
    nombre = models.CharField(max_length=100)
    dia_semana = models.CharField(max_length=3, choices=DIAS_SEMANA)

    def __str__(self):
        return f"{self.nombre} - {self.get_dia_semana_display()} ({self.usuario.username})"


class TipoEjercicio(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    grupo_muscular = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return f"{self.nombre} - {self.grupo_muscular}"


class EjercicioRutina(models.Model):
    id = models.AutoField(primary_key=True)
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE, related_name='ejercicios')
    tipo_ejercicio = models.ForeignKey(TipoEjercicio, on_delete=models.PROTECT)
    sets = models.PositiveIntegerField()
    repeticiones = models.PositiveIntegerField()
    record_peso = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  

    def __str__(self):
        return f"{self.tipo_ejercicio.nombre} en {self.rutina.nombre}"


class Publicacion(models.Model):
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='publicaciones')
    contenido = models.TextField()
    tipo = models.CharField(max_length=50)  # Ej: "record", "racha", etc.
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Publicación de {self.usuario} - {self.tipo}"


class Like(models.Model):
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='likes')
    publicacion = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('usuario', 'publicacion')

    def __str__(self):
        return f"{self.usuario} le dio like a {self.publicacion.id}"