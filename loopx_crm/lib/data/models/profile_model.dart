import 'package:freezed_annotation/freezed_annotation.dart';

part 'profile_model.freezed.dart';
part 'profile_model.g.dart';

@freezed
class ProfileModel with _$ProfileModel {
  const factory ProfileModel({
    required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'full_name') String? fullName,
    String? email,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
    String? role,
    @JsonKey(name: 'beta_features') @Default([]) List<String> betaFeatures,
    @JsonKey(name: 'account_id') String? accountId,
    @JsonKey(name: 'account_role') String? accountRole,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _ProfileModel;

  factory ProfileModel.fromJson(Map<String, dynamic> json) =>
      _$ProfileModelFromJson(json);

  static const String tableName = 'profiles';

  static const List<String> defaultSelect = [
    'id', 'user_id', 'full_name', 'email', 'avatar_url',
    'role', 'beta_features', 'account_id', 'account_role',
    'created_at', 'updated_at',
  ];
}

// ignore_for_file: invalid_annotation_target
