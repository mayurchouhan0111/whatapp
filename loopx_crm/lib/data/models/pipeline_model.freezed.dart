// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'pipeline_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

PipelineModel _$PipelineModelFromJson(Map<String, dynamic> json) {
  return _PipelineModel.fromJson(json);
}

/// @nodoc
mixin _$PipelineModel {
  @JsonKey(name: 'id')
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'user_id')
  String get userId => throw _privateConstructorUsedError;
  @JsonKey(name: 'name')
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'account_id')
  String? get accountId => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'stages')
  List<PipelineStageModel> get stages => throw _privateConstructorUsedError;

  /// Serializes this PipelineModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PipelineModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PipelineModelCopyWith<PipelineModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PipelineModelCopyWith<$Res> {
  factory $PipelineModelCopyWith(
    PipelineModel value,
    $Res Function(PipelineModel) then,
  ) = _$PipelineModelCopyWithImpl<$Res, PipelineModel>;
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'user_id') String userId,
    @JsonKey(name: 'name') String name,
    @JsonKey(name: 'account_id') String? accountId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'stages') List<PipelineStageModel> stages,
  });
}

/// @nodoc
class _$PipelineModelCopyWithImpl<$Res, $Val extends PipelineModel>
    implements $PipelineModelCopyWith<$Res> {
  _$PipelineModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PipelineModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? name = null,
    Object? accountId = freezed,
    Object? createdAt = freezed,
    Object? stages = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            accountId: freezed == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String?,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            stages: null == stages
                ? _value.stages
                : stages // ignore: cast_nullable_to_non_nullable
                      as List<PipelineStageModel>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PipelineModelImplCopyWith<$Res>
    implements $PipelineModelCopyWith<$Res> {
  factory _$$PipelineModelImplCopyWith(
    _$PipelineModelImpl value,
    $Res Function(_$PipelineModelImpl) then,
  ) = __$$PipelineModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'user_id') String userId,
    @JsonKey(name: 'name') String name,
    @JsonKey(name: 'account_id') String? accountId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'stages') List<PipelineStageModel> stages,
  });
}

/// @nodoc
class __$$PipelineModelImplCopyWithImpl<$Res>
    extends _$PipelineModelCopyWithImpl<$Res, _$PipelineModelImpl>
    implements _$$PipelineModelImplCopyWith<$Res> {
  __$$PipelineModelImplCopyWithImpl(
    _$PipelineModelImpl _value,
    $Res Function(_$PipelineModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PipelineModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? name = null,
    Object? accountId = freezed,
    Object? createdAt = freezed,
    Object? stages = null,
  }) {
    return _then(
      _$PipelineModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        accountId: freezed == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String?,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        stages: null == stages
            ? _value._stages
            : stages // ignore: cast_nullable_to_non_nullable
                  as List<PipelineStageModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PipelineModelImpl implements _PipelineModel {
  const _$PipelineModelImpl({
    @JsonKey(name: 'id') required this.id,
    @JsonKey(name: 'user_id') required this.userId,
    @JsonKey(name: 'name') required this.name,
    @JsonKey(name: 'account_id') this.accountId,
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'stages') final List<PipelineStageModel> stages = const [],
  }) : _stages = stages;

  factory _$PipelineModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PipelineModelImplFromJson(json);

  @override
  @JsonKey(name: 'id')
  final String id;
  @override
  @JsonKey(name: 'user_id')
  final String userId;
  @override
  @JsonKey(name: 'name')
  final String name;
  @override
  @JsonKey(name: 'account_id')
  final String? accountId;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final List<PipelineStageModel> _stages;
  @override
  @JsonKey(name: 'stages')
  List<PipelineStageModel> get stages {
    if (_stages is EqualUnmodifiableListView) return _stages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_stages);
  }

  @override
  String toString() {
    return 'PipelineModel(id: $id, userId: $userId, name: $name, accountId: $accountId, createdAt: $createdAt, stages: $stages)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PipelineModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            const DeepCollectionEquality().equals(other._stages, _stages));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    name,
    accountId,
    createdAt,
    const DeepCollectionEquality().hash(_stages),
  );

  /// Create a copy of PipelineModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PipelineModelImplCopyWith<_$PipelineModelImpl> get copyWith =>
      __$$PipelineModelImplCopyWithImpl<_$PipelineModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PipelineModelImplToJson(this);
  }
}

abstract class _PipelineModel implements PipelineModel {
  const factory _PipelineModel({
    @JsonKey(name: 'id') required final String id,
    @JsonKey(name: 'user_id') required final String userId,
    @JsonKey(name: 'name') required final String name,
    @JsonKey(name: 'account_id') final String? accountId,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'stages') final List<PipelineStageModel> stages,
  }) = _$PipelineModelImpl;

  factory _PipelineModel.fromJson(Map<String, dynamic> json) =
      _$PipelineModelImpl.fromJson;

  @override
  @JsonKey(name: 'id')
  String get id;
  @override
  @JsonKey(name: 'user_id')
  String get userId;
  @override
  @JsonKey(name: 'name')
  String get name;
  @override
  @JsonKey(name: 'account_id')
  String? get accountId;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'stages')
  List<PipelineStageModel> get stages;

  /// Create a copy of PipelineModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PipelineModelImplCopyWith<_$PipelineModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PipelineStageModel _$PipelineStageModelFromJson(Map<String, dynamic> json) {
  return _PipelineStageModel.fromJson(json);
}

/// @nodoc
mixin _$PipelineStageModel {
  @JsonKey(name: 'id')
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'pipeline_id')
  String get pipelineId => throw _privateConstructorUsedError;
  @JsonKey(name: 'name')
  String get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'position')
  int get position => throw _privateConstructorUsedError;
  @JsonKey(name: 'color')
  String get color => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'deals')
  List<DealModel> get deals => throw _privateConstructorUsedError;

  /// Serializes this PipelineStageModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PipelineStageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PipelineStageModelCopyWith<PipelineStageModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PipelineStageModelCopyWith<$Res> {
  factory $PipelineStageModelCopyWith(
    PipelineStageModel value,
    $Res Function(PipelineStageModel) then,
  ) = _$PipelineStageModelCopyWithImpl<$Res, PipelineStageModel>;
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'pipeline_id') String pipelineId,
    @JsonKey(name: 'name') String name,
    @JsonKey(name: 'position') int position,
    @JsonKey(name: 'color') String color,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'deals') List<DealModel> deals,
  });
}

/// @nodoc
class _$PipelineStageModelCopyWithImpl<$Res, $Val extends PipelineStageModel>
    implements $PipelineStageModelCopyWith<$Res> {
  _$PipelineStageModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PipelineStageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? pipelineId = null,
    Object? name = null,
    Object? position = null,
    Object? color = null,
    Object? createdAt = freezed,
    Object? deals = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            pipelineId: null == pipelineId
                ? _value.pipelineId
                : pipelineId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            position: null == position
                ? _value.position
                : position // ignore: cast_nullable_to_non_nullable
                      as int,
            color: null == color
                ? _value.color
                : color // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            deals: null == deals
                ? _value.deals
                : deals // ignore: cast_nullable_to_non_nullable
                      as List<DealModel>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$PipelineStageModelImplCopyWith<$Res>
    implements $PipelineStageModelCopyWith<$Res> {
  factory _$$PipelineStageModelImplCopyWith(
    _$PipelineStageModelImpl value,
    $Res Function(_$PipelineStageModelImpl) then,
  ) = __$$PipelineStageModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'pipeline_id') String pipelineId,
    @JsonKey(name: 'name') String name,
    @JsonKey(name: 'position') int position,
    @JsonKey(name: 'color') String color,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'deals') List<DealModel> deals,
  });
}

/// @nodoc
class __$$PipelineStageModelImplCopyWithImpl<$Res>
    extends _$PipelineStageModelCopyWithImpl<$Res, _$PipelineStageModelImpl>
    implements _$$PipelineStageModelImplCopyWith<$Res> {
  __$$PipelineStageModelImplCopyWithImpl(
    _$PipelineStageModelImpl _value,
    $Res Function(_$PipelineStageModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of PipelineStageModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? pipelineId = null,
    Object? name = null,
    Object? position = null,
    Object? color = null,
    Object? createdAt = freezed,
    Object? deals = null,
  }) {
    return _then(
      _$PipelineStageModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        pipelineId: null == pipelineId
            ? _value.pipelineId
            : pipelineId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        position: null == position
            ? _value.position
            : position // ignore: cast_nullable_to_non_nullable
                  as int,
        color: null == color
            ? _value.color
            : color // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        deals: null == deals
            ? _value._deals
            : deals // ignore: cast_nullable_to_non_nullable
                  as List<DealModel>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$PipelineStageModelImpl implements _PipelineStageModel {
  const _$PipelineStageModelImpl({
    @JsonKey(name: 'id') required this.id,
    @JsonKey(name: 'pipeline_id') required this.pipelineId,
    @JsonKey(name: 'name') required this.name,
    @JsonKey(name: 'position') this.position = 0,
    @JsonKey(name: 'color') this.color = '#3b82f6',
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'deals') final List<DealModel> deals = const [],
  }) : _deals = deals;

  factory _$PipelineStageModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PipelineStageModelImplFromJson(json);

  @override
  @JsonKey(name: 'id')
  final String id;
  @override
  @JsonKey(name: 'pipeline_id')
  final String pipelineId;
  @override
  @JsonKey(name: 'name')
  final String name;
  @override
  @JsonKey(name: 'position')
  final int position;
  @override
  @JsonKey(name: 'color')
  final String color;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  final List<DealModel> _deals;
  @override
  @JsonKey(name: 'deals')
  List<DealModel> get deals {
    if (_deals is EqualUnmodifiableListView) return _deals;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_deals);
  }

  @override
  String toString() {
    return 'PipelineStageModel(id: $id, pipelineId: $pipelineId, name: $name, position: $position, color: $color, createdAt: $createdAt, deals: $deals)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PipelineStageModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.pipelineId, pipelineId) ||
                other.pipelineId == pipelineId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.position, position) ||
                other.position == position) &&
            (identical(other.color, color) || other.color == color) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            const DeepCollectionEquality().equals(other._deals, _deals));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    pipelineId,
    name,
    position,
    color,
    createdAt,
    const DeepCollectionEquality().hash(_deals),
  );

  /// Create a copy of PipelineStageModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PipelineStageModelImplCopyWith<_$PipelineStageModelImpl> get copyWith =>
      __$$PipelineStageModelImplCopyWithImpl<_$PipelineStageModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$PipelineStageModelImplToJson(this);
  }
}

abstract class _PipelineStageModel implements PipelineStageModel {
  const factory _PipelineStageModel({
    @JsonKey(name: 'id') required final String id,
    @JsonKey(name: 'pipeline_id') required final String pipelineId,
    @JsonKey(name: 'name') required final String name,
    @JsonKey(name: 'position') final int position,
    @JsonKey(name: 'color') final String color,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'deals') final List<DealModel> deals,
  }) = _$PipelineStageModelImpl;

  factory _PipelineStageModel.fromJson(Map<String, dynamic> json) =
      _$PipelineStageModelImpl.fromJson;

  @override
  @JsonKey(name: 'id')
  String get id;
  @override
  @JsonKey(name: 'pipeline_id')
  String get pipelineId;
  @override
  @JsonKey(name: 'name')
  String get name;
  @override
  @JsonKey(name: 'position')
  int get position;
  @override
  @JsonKey(name: 'color')
  String get color;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'deals')
  List<DealModel> get deals;

  /// Create a copy of PipelineStageModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PipelineStageModelImplCopyWith<_$PipelineStageModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DealModel _$DealModelFromJson(Map<String, dynamic> json) {
  return _DealModel.fromJson(json);
}

/// @nodoc
mixin _$DealModel {
  @JsonKey(name: 'id')
  String get id => throw _privateConstructorUsedError;
  @JsonKey(name: 'user_id')
  String get userId => throw _privateConstructorUsedError;
  @JsonKey(name: 'pipeline_id')
  String get pipelineId => throw _privateConstructorUsedError;
  @JsonKey(name: 'stage_id')
  String get stageId => throw _privateConstructorUsedError;
  @JsonKey(name: 'contact_id')
  String? get contactId => throw _privateConstructorUsedError;
  @JsonKey(name: 'conversation_id')
  String? get conversationId => throw _privateConstructorUsedError;
  @JsonKey(name: 'assigned_to')
  String? get assignedTo => throw _privateConstructorUsedError;
  @JsonKey(name: 'title')
  String get title => throw _privateConstructorUsedError;
  @JsonKey(name: 'value')
  double get value => throw _privateConstructorUsedError;
  @JsonKey(name: 'currency')
  String get currency => throw _privateConstructorUsedError;
  @JsonKey(name: 'notes')
  String? get notes => throw _privateConstructorUsedError;
  @JsonKey(name: 'expected_close_date')
  DateTime? get expectedCloseDate => throw _privateConstructorUsedError;
  @JsonKey(name: 'status')
  String get status => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  DateTime? get createdAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'account_id')
  String? get accountId => throw _privateConstructorUsedError;

  /// Serializes this DealModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DealModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DealModelCopyWith<DealModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DealModelCopyWith<$Res> {
  factory $DealModelCopyWith(DealModel value, $Res Function(DealModel) then) =
      _$DealModelCopyWithImpl<$Res, DealModel>;
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'user_id') String userId,
    @JsonKey(name: 'pipeline_id') String pipelineId,
    @JsonKey(name: 'stage_id') String stageId,
    @JsonKey(name: 'contact_id') String? contactId,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'assigned_to') String? assignedTo,
    @JsonKey(name: 'title') String title,
    @JsonKey(name: 'value') double value,
    @JsonKey(name: 'currency') String currency,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'expected_close_date') DateTime? expectedCloseDate,
    @JsonKey(name: 'status') String status,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'account_id') String? accountId,
  });
}

/// @nodoc
class _$DealModelCopyWithImpl<$Res, $Val extends DealModel>
    implements $DealModelCopyWith<$Res> {
  _$DealModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DealModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? pipelineId = null,
    Object? stageId = null,
    Object? contactId = freezed,
    Object? conversationId = freezed,
    Object? assignedTo = freezed,
    Object? title = null,
    Object? value = null,
    Object? currency = null,
    Object? notes = freezed,
    Object? expectedCloseDate = freezed,
    Object? status = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? accountId = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            pipelineId: null == pipelineId
                ? _value.pipelineId
                : pipelineId // ignore: cast_nullable_to_non_nullable
                      as String,
            stageId: null == stageId
                ? _value.stageId
                : stageId // ignore: cast_nullable_to_non_nullable
                      as String,
            contactId: freezed == contactId
                ? _value.contactId
                : contactId // ignore: cast_nullable_to_non_nullable
                      as String?,
            conversationId: freezed == conversationId
                ? _value.conversationId
                : conversationId // ignore: cast_nullable_to_non_nullable
                      as String?,
            assignedTo: freezed == assignedTo
                ? _value.assignedTo
                : assignedTo // ignore: cast_nullable_to_non_nullable
                      as String?,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            value: null == value
                ? _value.value
                : value // ignore: cast_nullable_to_non_nullable
                      as double,
            currency: null == currency
                ? _value.currency
                : currency // ignore: cast_nullable_to_non_nullable
                      as String,
            notes: freezed == notes
                ? _value.notes
                : notes // ignore: cast_nullable_to_non_nullable
                      as String?,
            expectedCloseDate: freezed == expectedCloseDate
                ? _value.expectedCloseDate
                : expectedCloseDate // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            createdAt: freezed == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            updatedAt: freezed == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            accountId: freezed == accountId
                ? _value.accountId
                : accountId // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$DealModelImplCopyWith<$Res>
    implements $DealModelCopyWith<$Res> {
  factory _$$DealModelImplCopyWith(
    _$DealModelImpl value,
    $Res Function(_$DealModelImpl) then,
  ) = __$$DealModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    @JsonKey(name: 'id') String id,
    @JsonKey(name: 'user_id') String userId,
    @JsonKey(name: 'pipeline_id') String pipelineId,
    @JsonKey(name: 'stage_id') String stageId,
    @JsonKey(name: 'contact_id') String? contactId,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'assigned_to') String? assignedTo,
    @JsonKey(name: 'title') String title,
    @JsonKey(name: 'value') double value,
    @JsonKey(name: 'currency') String currency,
    @JsonKey(name: 'notes') String? notes,
    @JsonKey(name: 'expected_close_date') DateTime? expectedCloseDate,
    @JsonKey(name: 'status') String status,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
    @JsonKey(name: 'account_id') String? accountId,
  });
}

/// @nodoc
class __$$DealModelImplCopyWithImpl<$Res>
    extends _$DealModelCopyWithImpl<$Res, _$DealModelImpl>
    implements _$$DealModelImplCopyWith<$Res> {
  __$$DealModelImplCopyWithImpl(
    _$DealModelImpl _value,
    $Res Function(_$DealModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of DealModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? pipelineId = null,
    Object? stageId = null,
    Object? contactId = freezed,
    Object? conversationId = freezed,
    Object? assignedTo = freezed,
    Object? title = null,
    Object? value = null,
    Object? currency = null,
    Object? notes = freezed,
    Object? expectedCloseDate = freezed,
    Object? status = null,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? accountId = freezed,
  }) {
    return _then(
      _$DealModelImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        pipelineId: null == pipelineId
            ? _value.pipelineId
            : pipelineId // ignore: cast_nullable_to_non_nullable
                  as String,
        stageId: null == stageId
            ? _value.stageId
            : stageId // ignore: cast_nullable_to_non_nullable
                  as String,
        contactId: freezed == contactId
            ? _value.contactId
            : contactId // ignore: cast_nullable_to_non_nullable
                  as String?,
        conversationId: freezed == conversationId
            ? _value.conversationId
            : conversationId // ignore: cast_nullable_to_non_nullable
                  as String?,
        assignedTo: freezed == assignedTo
            ? _value.assignedTo
            : assignedTo // ignore: cast_nullable_to_non_nullable
                  as String?,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        value: null == value
            ? _value.value
            : value // ignore: cast_nullable_to_non_nullable
                  as double,
        currency: null == currency
            ? _value.currency
            : currency // ignore: cast_nullable_to_non_nullable
                  as String,
        notes: freezed == notes
            ? _value.notes
            : notes // ignore: cast_nullable_to_non_nullable
                  as String?,
        expectedCloseDate: freezed == expectedCloseDate
            ? _value.expectedCloseDate
            : expectedCloseDate // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        createdAt: freezed == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        updatedAt: freezed == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        accountId: freezed == accountId
            ? _value.accountId
            : accountId // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$DealModelImpl implements _DealModel {
  const _$DealModelImpl({
    @JsonKey(name: 'id') required this.id,
    @JsonKey(name: 'user_id') required this.userId,
    @JsonKey(name: 'pipeline_id') required this.pipelineId,
    @JsonKey(name: 'stage_id') required this.stageId,
    @JsonKey(name: 'contact_id') this.contactId,
    @JsonKey(name: 'conversation_id') this.conversationId,
    @JsonKey(name: 'assigned_to') this.assignedTo,
    @JsonKey(name: 'title') required this.title,
    @JsonKey(name: 'value') this.value = 0,
    @JsonKey(name: 'currency') this.currency = 'USD',
    @JsonKey(name: 'notes') this.notes,
    @JsonKey(name: 'expected_close_date') this.expectedCloseDate,
    @JsonKey(name: 'status') this.status = 'open',
    @JsonKey(name: 'created_at') this.createdAt,
    @JsonKey(name: 'updated_at') this.updatedAt,
    @JsonKey(name: 'account_id') this.accountId,
  });

  factory _$DealModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$DealModelImplFromJson(json);

  @override
  @JsonKey(name: 'id')
  final String id;
  @override
  @JsonKey(name: 'user_id')
  final String userId;
  @override
  @JsonKey(name: 'pipeline_id')
  final String pipelineId;
  @override
  @JsonKey(name: 'stage_id')
  final String stageId;
  @override
  @JsonKey(name: 'contact_id')
  final String? contactId;
  @override
  @JsonKey(name: 'conversation_id')
  final String? conversationId;
  @override
  @JsonKey(name: 'assigned_to')
  final String? assignedTo;
  @override
  @JsonKey(name: 'title')
  final String title;
  @override
  @JsonKey(name: 'value')
  final double value;
  @override
  @JsonKey(name: 'currency')
  final String currency;
  @override
  @JsonKey(name: 'notes')
  final String? notes;
  @override
  @JsonKey(name: 'expected_close_date')
  final DateTime? expectedCloseDate;
  @override
  @JsonKey(name: 'status')
  final String status;
  @override
  @JsonKey(name: 'created_at')
  final DateTime? createdAt;
  @override
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;
  @override
  @JsonKey(name: 'account_id')
  final String? accountId;

  @override
  String toString() {
    return 'DealModel(id: $id, userId: $userId, pipelineId: $pipelineId, stageId: $stageId, contactId: $contactId, conversationId: $conversationId, assignedTo: $assignedTo, title: $title, value: $value, currency: $currency, notes: $notes, expectedCloseDate: $expectedCloseDate, status: $status, createdAt: $createdAt, updatedAt: $updatedAt, accountId: $accountId)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DealModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.pipelineId, pipelineId) ||
                other.pipelineId == pipelineId) &&
            (identical(other.stageId, stageId) || other.stageId == stageId) &&
            (identical(other.contactId, contactId) ||
                other.contactId == contactId) &&
            (identical(other.conversationId, conversationId) ||
                other.conversationId == conversationId) &&
            (identical(other.assignedTo, assignedTo) ||
                other.assignedTo == assignedTo) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.value, value) || other.value == value) &&
            (identical(other.currency, currency) ||
                other.currency == currency) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.expectedCloseDate, expectedCloseDate) ||
                other.expectedCloseDate == expectedCloseDate) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.accountId, accountId) ||
                other.accountId == accountId));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    pipelineId,
    stageId,
    contactId,
    conversationId,
    assignedTo,
    title,
    value,
    currency,
    notes,
    expectedCloseDate,
    status,
    createdAt,
    updatedAt,
    accountId,
  );

  /// Create a copy of DealModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DealModelImplCopyWith<_$DealModelImpl> get copyWith =>
      __$$DealModelImplCopyWithImpl<_$DealModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DealModelImplToJson(this);
  }
}

abstract class _DealModel implements DealModel {
  const factory _DealModel({
    @JsonKey(name: 'id') required final String id,
    @JsonKey(name: 'user_id') required final String userId,
    @JsonKey(name: 'pipeline_id') required final String pipelineId,
    @JsonKey(name: 'stage_id') required final String stageId,
    @JsonKey(name: 'contact_id') final String? contactId,
    @JsonKey(name: 'conversation_id') final String? conversationId,
    @JsonKey(name: 'assigned_to') final String? assignedTo,
    @JsonKey(name: 'title') required final String title,
    @JsonKey(name: 'value') final double value,
    @JsonKey(name: 'currency') final String currency,
    @JsonKey(name: 'notes') final String? notes,
    @JsonKey(name: 'expected_close_date') final DateTime? expectedCloseDate,
    @JsonKey(name: 'status') final String status,
    @JsonKey(name: 'created_at') final DateTime? createdAt,
    @JsonKey(name: 'updated_at') final DateTime? updatedAt,
    @JsonKey(name: 'account_id') final String? accountId,
  }) = _$DealModelImpl;

  factory _DealModel.fromJson(Map<String, dynamic> json) =
      _$DealModelImpl.fromJson;

  @override
  @JsonKey(name: 'id')
  String get id;
  @override
  @JsonKey(name: 'user_id')
  String get userId;
  @override
  @JsonKey(name: 'pipeline_id')
  String get pipelineId;
  @override
  @JsonKey(name: 'stage_id')
  String get stageId;
  @override
  @JsonKey(name: 'contact_id')
  String? get contactId;
  @override
  @JsonKey(name: 'conversation_id')
  String? get conversationId;
  @override
  @JsonKey(name: 'assigned_to')
  String? get assignedTo;
  @override
  @JsonKey(name: 'title')
  String get title;
  @override
  @JsonKey(name: 'value')
  double get value;
  @override
  @JsonKey(name: 'currency')
  String get currency;
  @override
  @JsonKey(name: 'notes')
  String? get notes;
  @override
  @JsonKey(name: 'expected_close_date')
  DateTime? get expectedCloseDate;
  @override
  @JsonKey(name: 'status')
  String get status;
  @override
  @JsonKey(name: 'created_at')
  DateTime? get createdAt;
  @override
  @JsonKey(name: 'updated_at')
  DateTime? get updatedAt;
  @override
  @JsonKey(name: 'account_id')
  String? get accountId;

  /// Create a copy of DealModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DealModelImplCopyWith<_$DealModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
