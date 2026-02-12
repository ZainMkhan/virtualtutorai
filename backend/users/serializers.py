from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    access_token = serializers.CharField(read_only=True)
    refresh_token = serializers.CharField(read_only=True)
    access_token_expiry = serializers.DateTimeField(read_only=True)
    refresh_token_expiry = serializers.DateTimeField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    role = serializers.CharField(read_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Find user by email first, then authenticate with username
            try:
                user = User.objects.get(email=email)
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                user = None
                
            if user:
                if user.is_active:
                    refresh = RefreshToken.for_user(user)
                    access_token = refresh.access_token
                    
                    # Calculate token expiry times
                    access_token_lifetime = settings.SIMPLE_JWT.get('ACCESS_TOKEN_LIFETIME', timedelta(hours=1))
                    refresh_token_lifetime = settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME', timedelta(days=7))
                    
                    current_time = timezone.now()
                    access_expiry = current_time + access_token_lifetime
                    refresh_expiry = current_time + refresh_token_lifetime
                    
                    attrs['access_token'] = str(access_token)
                    attrs['refresh_token'] = str(refresh)
                    attrs['access_token_expiry'] = access_expiry
                    attrs['refresh_token_expiry'] = refresh_expiry
                    attrs['user_id'] = user.id
                    attrs['role'] = user.role
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserProfileReadSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    subscription_tier = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username', 
            'email',
            'first_name',
            'last_name',
            'full_name',
            'dob',
            'role',
            'status',
            'is_admin',
            'subscription_tier',
            'date_joined',
            'additional_information'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_is_admin(self, obj):
        return obj.role == obj.Role.ADMIN
    
    def get_subscription_tier(self, obj):
        """Get current subscription tier for user"""
        try:
            if hasattr(obj, 'subscription') and obj.subscription:
                return {
                    'id': str(obj.subscription.tier.id),
                    'tier': obj.subscription.tier.tier,
                    'name': obj.subscription.tier.name,
                    'display_name': obj.subscription.tier.display_name,
                }
        except:
            pass
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'dob',
            'preferred_language',
            'additional_information'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def create(self, validated_data):
        # Remove password_confirm from validated_data
        validated_data.pop('password_confirm', None)
        
        # Create user using the custom manager
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'dob',
            'additional_information'
        ]

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value


class UserDeleteSerializer(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=[
            ('soft_delete', 'Soft Delete'),
            ('change_status', 'Change Status'),
            ('restore', 'Restore User')
        ],
        help_text="Action to perform on the user"
    )
    status = serializers.ChoiceField(
        choices=User.Status.choices,
        required=False,
        help_text="New status for the user (required when action is 'change_status')"
    )
    reason = serializers.CharField(
        max_length=255,
        required=False,
        help_text="Optional reason for the action"
    )

    def validate(self, attrs):
        action = attrs.get('action')
        status_value = attrs.get('status')
        
        if action == 'change_status' and not status_value:
            raise serializers.ValidationError('Status is required when action is change_status.')
        
        return attrs

