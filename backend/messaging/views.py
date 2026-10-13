from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Conversation.objects.all()
        return Conversation.objects.filter(Q(tenant=user) | Q(owner=user))

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        return Message.objects.filter(conversation_id=conversation_id).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        serializer.save(sender=self.request.user, conversation_id=conversation_id)
