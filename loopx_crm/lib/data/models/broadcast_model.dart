class BroadcastModel {
  final String id;
  final String name;
  final String templateName;
  final String? templateLanguage;
  final String status; // draft, scheduled, sending, sent, failed
  final int totalRecipients;
  final int sentCount;
  final int deliveredCount;
  final int readCount;
  final int repliedCount;
  final int failedCount;
  final DateTime? scheduledAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  BroadcastModel({
    required this.id,
    required this.name,
    required this.templateName,
    this.templateLanguage,
    required this.status,
    this.totalRecipients = 0,
    this.sentCount = 0,
    this.deliveredCount = 0,
    this.readCount = 0,
    this.repliedCount = 0,
    this.failedCount = 0,
    this.scheduledAt,
    required this.createdAt,
    required this.updatedAt,
  });

  double get deliveryRate =>
      sentCount > 0 ? deliveredCount / sentCount : 0.0;

  double get readRate =>
      deliveredCount > 0 ? readCount / deliveredCount : 0.0;

  factory BroadcastModel.fromJson(Map<String, dynamic> json) {
    return BroadcastModel(
      id: json['id'] as String,
      name: json['name'] as String,
      templateName: json['template_name'] as String? ?? '',
      templateLanguage: json['template_language'] as String?,
      status: json['status'] as String? ?? 'draft',
      totalRecipients: json['total_recipients'] as int? ?? 0,
      sentCount: json['sent_count'] as int? ?? 0,
      deliveredCount: json['delivered_count'] as int? ?? 0,
      readCount: json['read_count'] as int? ?? 0,
      repliedCount: json['replied_count'] as int? ?? 0,
      failedCount: json['failed_count'] as int? ?? 0,
      scheduledAt: json['scheduled_at'] != null
          ? DateTime.tryParse(json['scheduled_at'] as String)
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'template_name': templateName,
      'template_language': templateLanguage,
      'status': status,
      'total_recipients': totalRecipients,
      'sent_count': sentCount,
      'delivered_count': deliveredCount,
      'read_count': readCount,
      'replied_count': repliedCount,
      'failed_count': failedCount,
      'scheduled_at': scheduledAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static const String tableName = 'broadcasts';
}
