import 'package:freezed_annotation/freezed_annotation.dart';

part 'account_model.freezed.dart';
part 'account_model.g.dart';

@freezed
class AccountModel with _$AccountModel {
  const factory AccountModel({
    required String id,
    required String name,
    required String ownerUserId,
    @Default('USD') String defaultCurrency,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _AccountModel;

  factory AccountModel.fromJson(Map<String, dynamic> json) =>
      _$AccountModelFromJson(json);

  static const String tableName = 'accounts';

  static const List<String> defaultSelect = [
    'id', 'name', 'owner_user_id', 'default_currency',
    'created_at', 'updated_at',
  ];
}
