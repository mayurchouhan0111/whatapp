class AutomationModel {
  final String id;
  final String name;
  final String? description;
  final String triggerType;
  final Map<String, dynamic> triggerConfig;
  final bool isActive;
  final int executionCount;
  final DateTime? lastExecutedAt;
  final DateTime createdAt;

  AutomationModel({
    required this.id,
    required this.name,
    this.description,
    required this.triggerType,
    required this.triggerConfig,
    required this.isActive,
    required this.executionCount,
    this.lastExecutedAt,
    required this.createdAt,
  });

  factory AutomationModel.fromJson(Map<String, dynamic> json) {
    return AutomationModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      triggerType: json['trigger_type'] as String? ?? 'welcome_message',
      triggerConfig: (json['trigger_config'] as Map<String, dynamic>?) ?? {},
      isActive: json['is_active'] as bool? ?? false,
      executionCount: json['execution_count'] as int? ?? 0,
      lastExecutedAt: json['last_executed_at'] != null 
          ? DateTime.tryParse(json['last_executed_at'] as String) 
          : null,
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'trigger_type': triggerType,
      'trigger_config': triggerConfig,
      'is_active': isActive,
      'execution_count': executionCount,
      'last_executed_at': lastExecutedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  static const String tableName = 'automations';
}
