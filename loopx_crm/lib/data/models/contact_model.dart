import 'package:freezed_annotation/freezed_annotation.dart';

part 'contact_model.freezed.dart';
part 'contact_model.g.dart';

@freezed
class ContactModel with _$ContactModel {
  const factory ContactModel({
    @JsonKey(name: 'id') required String id,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'phone') required String phone,
    @JsonKey(name: 'name') String? name,
    @JsonKey(name: 'email') String? email,
    @JsonKey(name: 'company') String? company,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
    @JsonKey(name: 'account_id') String? accountId,
    @JsonKey(name: 'created_at') DateTime? createdAt,
    @JsonKey(name: 'updated_at') DateTime? updatedAt,
  }) = _ContactModel;

  factory ContactModel.fromJson(Map<String, dynamic> json) =>
      _$ContactModelFromJson(json);

  static const String tableName = 'contacts';

  static const List<String> defaultSelect = [
    'id', 'user_id', 'phone', 'name', 'email',
    'company', 'avatar_url', 'account_id',
    'created_at', 'updated_at',
  ];
}
