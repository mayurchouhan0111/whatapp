// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'conversation_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ConversationModelImpl _$$ConversationModelImplFromJson(
  Map<String, dynamic> json,
) => _$ConversationModelImpl(
  id: json['id'] as String,
  userId: json['userId'] as String,
  contactId: json['contactId'] as String,
  status: json['status'] as String,
  assignedAgentId: json['assignedAgentId'] as String?,
  lastMessageText: json['lastMessageText'] as String?,
  lastMessageAt: json['lastMessageAt'] == null
      ? null
      : DateTime.parse(json['lastMessageAt'] as String),
  unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
  accountId: json['accountId'] as String?,
  createdAt: json['createdAt'] == null
      ? null
      : DateTime.parse(json['createdAt'] as String),
  updatedAt: json['updatedAt'] == null
      ? null
      : DateTime.parse(json['updatedAt'] as String),
  contact: json['contact'] == null
      ? null
      : ContactModel.fromJson(json['contact'] as Map<String, dynamic>),
);

Map<String, dynamic> _$$ConversationModelImplToJson(
  _$ConversationModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'contactId': instance.contactId,
  'status': instance.status,
  'assignedAgentId': instance.assignedAgentId,
  'lastMessageText': instance.lastMessageText,
  'lastMessageAt': instance.lastMessageAt?.toIso8601String(),
  'unreadCount': instance.unreadCount,
  'accountId': instance.accountId,
  'createdAt': instance.createdAt?.toIso8601String(),
  'updatedAt': instance.updatedAt?.toIso8601String(),
  'contact': instance.contact,
};
