from rest_framework import serializers
from .models import Conversation, Message
from avatars.serializers import AvatarListSerializer


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model.
    Handles both reading and writing messages.
    """
    
    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'role',
            'sender_type',
            'content',
            'metadata',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ConversationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Conversation with all messages included.
    Used for GET conversation by ID endpoint.
    """
    
    messages = MessageSerializer(many=True, read_only=True)
    avatar = AvatarListSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'user',
            'avatar',
            'title',
            'is_active',
            'message_count',
            'last_message',
            'messages',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Get total number of messages"""
        return obj.get_message_count()
    
    def get_last_message(self, obj):
        """Get the last message content"""
        last_msg = obj.get_last_message()
        return last_msg.content if last_msg else None


class ConversationListSerializer(serializers.ModelSerializer):
    """
    Serializer for Conversation list view.
    Includes summary information without all messages.
    """
    
    avatar = AvatarListSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id',
            'user',
            'avatar',
            'title',
            'is_active',
            'message_count',
            'last_message',
            'last_message_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        """Get total number of messages"""
        return obj.get_message_count()
    
    def get_last_message(self, obj):
        """Get the last message content"""
        last_msg = obj.get_last_message()
        return last_msg.content if last_msg else None
    
    def get_last_message_at(self, obj):
        """Get timestamp of last message"""
        last_msg = obj.get_last_message()
        return last_msg.created_at if last_msg else None


class ConversationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new conversation.
    """
    
    avatar_id = serializers.UUIDField(required=False, allow_null=True)
    
    class Meta:
        model = Conversation
        fields = ['avatar_id', 'title']
    
    def create(self, validated_data):
        """Create a new conversation"""
        # Remove avatar_id and get the avatar object
        avatar_id = validated_data.pop('avatar_id', None)
        avatar = None
        
        if avatar_id:
            from avatars.models import Avatar
            avatar = Avatar.objects.filter(id=avatar_id).first()
        
        # Get user from request context
        user = self.context['request'].user
        
        # Create conversation
        conversation = Conversation.objects.create(
            user=user,
            avatar=avatar,
            **validated_data
        )
        
        return conversation
