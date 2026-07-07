// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pipeline_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PipelineModelImpl _$$PipelineModelImplFromJson(Map<String, dynamic> json) =>
    _$PipelineModelImpl(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      accountId: json['account_id'] as String?,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      stages:
          (json['stages'] as List<dynamic>?)
              ?.map(
                (e) => PipelineStageModel.fromJson(e as Map<String, dynamic>),
              )
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$PipelineModelImplToJson(_$PipelineModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'name': instance.name,
      'account_id': instance.accountId,
      'created_at': instance.createdAt?.toIso8601String(),
      'stages': instance.stages,
    };

_$PipelineStageModelImpl _$$PipelineStageModelImplFromJson(
  Map<String, dynamic> json,
) => _$PipelineStageModelImpl(
  id: json['id'] as String,
  pipelineId: json['pipeline_id'] as String,
  name: json['name'] as String,
  position: (json['position'] as num?)?.toInt() ?? 0,
  color: json['color'] as String? ?? '#3b82f6',
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
  deals:
      (json['deals'] as List<dynamic>?)
          ?.map((e) => DealModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$$PipelineStageModelImplToJson(
  _$PipelineStageModelImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'pipeline_id': instance.pipelineId,
  'name': instance.name,
  'position': instance.position,
  'color': instance.color,
  'created_at': instance.createdAt?.toIso8601String(),
  'deals': instance.deals,
};

_$DealModelImpl _$$DealModelImplFromJson(Map<String, dynamic> json) =>
    _$DealModelImpl(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      pipelineId: json['pipeline_id'] as String,
      stageId: json['stage_id'] as String,
      contactId: json['contact_id'] as String?,
      conversationId: json['conversation_id'] as String?,
      assignedTo: json['assigned_to'] as String?,
      title: json['title'] as String,
      value: (json['value'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'USD',
      notes: json['notes'] as String?,
      expectedCloseDate: json['expected_close_date'] == null
          ? null
          : DateTime.parse(json['expected_close_date'] as String),
      status: json['status'] as String? ?? 'open',
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
      accountId: json['account_id'] as String?,
    );

Map<String, dynamic> _$$DealModelImplToJson(_$DealModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'pipeline_id': instance.pipelineId,
      'stage_id': instance.stageId,
      'contact_id': instance.contactId,
      'conversation_id': instance.conversationId,
      'assigned_to': instance.assignedTo,
      'title': instance.title,
      'value': instance.value,
      'currency': instance.currency,
      'notes': instance.notes,
      'expected_close_date': instance.expectedCloseDate?.toIso8601String(),
      'status': instance.status,
      'created_at': instance.createdAt?.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
      'account_id': instance.accountId,
    };
