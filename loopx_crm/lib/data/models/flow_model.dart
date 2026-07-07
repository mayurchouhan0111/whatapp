class FlowModel {
  final String id;
  final String name;
  final String? description;
  final String status; // 'draft', 'active', 'archived'
  final String triggerType; // 'keyword', 'first_inbound_message', 'manual'
  final Map<String, dynamic> triggerConfig;
  final int executionCount;
  final DateTime? lastExecutedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  FlowModel({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    required this.triggerType,
    required this.triggerConfig,
    required this.executionCount,
    this.lastExecutedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FlowModel.fromJson(Map<String, dynamic> json) {
    return FlowModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      status: json['status'] as String? ?? 'draft',
      triggerType: json['trigger_type'] as String? ?? 'keyword',
      triggerConfig: (json['trigger_config'] as Map<String, dynamic>?) ?? {},
      executionCount: json['execution_count'] as int? ?? 0,
      lastExecutedAt: json['last_executed_at'] != null 
          ? DateTime.tryParse(json['last_executed_at'] as String) 
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
      'description': description,
      'status': status,
      'trigger_type': triggerType,
      'trigger_config': triggerConfig,
      'execution_count': executionCount,
      'last_executed_at': lastExecutedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static const String tableName = 'flows';
}
