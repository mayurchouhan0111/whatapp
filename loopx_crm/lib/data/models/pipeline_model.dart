import 'package:freezed_annotation/freezed_annotation.dart';

part 'pipeline_model.freezed.dart';
part 'pipeline_model.g.dart';

@freezed
class PipelineModel with _$PipelineModel {
  const factory PipelineModel({
    @JsonKey(name: 'id') required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'name') required String name,
    @JsonKey(name: 'account_id') String? accountId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @Default([]) @JsonKey(name: 'stages') List<PipelineStageModel> stages,
  }) = _PipelineModel;

  factory PipelineModel.fromJson(Map<String, dynamic> json) =>
      _$PipelineModelFromJson(json);

  static const String tableName = 'pipelines';
}

@freezed
class PipelineStageModel with _$PipelineStageModel {
  const factory PipelineStageModel({
    @JsonKey(name: 'id') required String id,
    @JsonKey(name: 'pipeline_id') required String pipelineId,
    @JsonKey(name: 'name') required String name,
    @Default(0) @JsonKey(name: 'position') int position,
    @Default('#3b82f6') @JsonKey(name: 'color') String color,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @Default([]) @JsonKey(name: 'deals') List<DealModel> deals,
  }) = _PipelineStageModel;

  factory PipelineStageModel.fromJson(Map<String, dynamic> json) =>
      _$PipelineStageModelFromJson(json);

  static const String tableName = 'pipeline_stages';
}

@freezed
class DealModel with _$DealModel {
  const factory DealModel({
    @JsonKey(name: 'id') required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'pipeline_id') required String pipelineId,
    @JsonKey(name: 'stage_id') required String stageId,
    @JsonKey(name: 'contact_id') String? contactId,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'assigned_to') String? assignedTo,
    @JsonKey(name: 'title') required String title,
    @Default(0) @JsonKey(name: 'value') double value,
    @Default('USD') @JsonKey(name: 'currency') String currency,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'expected_close_date') DateTime? expectedCloseDate,
    @Default('open') @JsonKey(name: 'status') String status,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'account_id') String? accountId,
  }) = _DealModel;

  factory DealModel.fromJson(Map<String, dynamic> json) =>
      _$DealModelFromJson(json);

  static const String tableName = 'deals';
}
