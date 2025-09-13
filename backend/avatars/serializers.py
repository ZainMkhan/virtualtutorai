from rest_framework import serializers
from .models import Avatar
from users.serializers import UserProfileReadSerializer


class AvatarReadSerializer(serializers.ModelSerializer):
    user = UserProfileReadSerializer(source='user_id', read_only=True)
    user_id = serializers.UUIDField(read_only=True)
    
    class Meta:
        model = Avatar
        fields = [
            'id',
            'user_id',
            'user',
            'category',
            'name',
            'avatar_id',
            'embed_url',
            'preview_image',
            'quality',
            'transparent_background',
            'metadata',
            'is_active',
            'created_at',
            'updated_at'
        ]


class AvatarCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = [
            'category',
            'name',
            'avatar_id',
            'embed_url',
            'preview_image',
            'quality',
            'transparent_background',
            'metadata',
            'is_active'
        ]
    
    def validate_avatar_id(self, value):
        if Avatar.objects.filter(avatar_id=value).exists():
            raise serializers.ValidationError('Avatar ID already exists.')
        return value


class AvatarUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avatar
        fields = [
            'category',
            'name',
            'embed_url',
            'preview_image',
            'quality',
            'transparent_background',
            'metadata',
            'is_active'
        ]


class AvatarListSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user_id.username', read_only=True)
    
    class Meta:
        model = Avatar
        fields = [
            'id',
            'user_id',
            'user_username',
            'category',
            'name',
            'avatar_id',
            'preview_image',
            'quality',
            'is_active',
            'created_at'
        ]
