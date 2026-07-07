import 'package:flutter_test/flutter_test.dart';
import 'package:loopx_crm/data/models/broadcast_model.dart';

void main() {
  group('BroadcastModel fromJson', () {
    test('parses a complete broadcast JSON correctly', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'name': 'Welcome Campaign',
        'template_name': 'welcome_template',
        'template_language': 'en_US',
        'status': 'active',
        'total_recipients': 150,
        'sent_count': 150,
        'delivered_count': 142,
        'read_count': 98,
        'replied_count': 12,
        'failed_count': 0,
        'created_at': '2026-07-01T10:00:00Z',
        'updated_at': '2026-07-02T10:00:00Z',
      };

      final model = BroadcastModel.fromJson(json);

      expect(model.id, '123e4567-e89b-12d3-a456-426614174000');
      expect(model.name, 'Welcome Campaign');
      expect(model.templateName, 'welcome_template');
      expect(model.status, 'active');
      expect(model.totalRecipients, 150);
      expect(model.sentCount, 150);
      expect(model.deliveredCount, 142);
      expect(model.readCount, 98);
      expect(model.repliedCount, 12);
      expect(model.failedCount, 0);
    });

    test('calculates delivery rate correctly', () {
      final model = BroadcastModel(
        id: '1',
        name: 'Test',
        templateName: 't',
        status: 'sent',
        sentCount: 100,
        deliveredCount: 80,
        readCount: 0,
        repliedCount: 0,
        failedCount: 0,
        totalRecipients: 100,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(model.deliveryRate, 0.8);
    });

    test('calculates read rate correctly', () {
      final model = BroadcastModel(
        id: '1',
        name: 'Test',
        templateName: 't',
        status: 'sent',
        sentCount: 100,
        deliveredCount: 80,
        readCount: 40,
        repliedCount: 0,
        failedCount: 0,
        totalRecipients: 100,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(model.readRate, 0.5);
    });

    test('returns 0 delivery rate when sentCount is 0', () {
      final model = BroadcastModel(
        id: '1',
        name: 'Test',
        templateName: 't',
        status: 'draft',
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        repliedCount: 0,
        failedCount: 0,
        totalRecipients: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      expect(model.deliveryRate, 0.0);
      expect(model.readRate, 0.0);
    });

    test('handles null fields in JSON gracefully', () {
      final json = {
        'id': '123e4567-e89b-12d3-a456-426614174000',
        'name': 'Minimal Broadcast',
        'template_name': null,
        'status': 'draft',
        'created_at': null,
        'updated_at': null,
      };

      final model = BroadcastModel.fromJson(json);

      expect(model.name, 'Minimal Broadcast');
      expect(model.templateName, '');
      expect(model.sentCount, 0);
      expect(model.deliveredCount, 0);
      expect(model.status, 'draft');
      expect(model.createdAt, isA<DateTime>());
    });

    test('round-trip JSON serialization', () {
      final original = BroadcastModel(
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Campaign',
        templateName: 'test_template',
        templateLanguage: 'en_US',
        status: 'scheduled',
        totalRecipients: 200,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        repliedCount: 0,
        failedCount: 0,
        scheduledAt: DateTime(2026, 7, 15, 10, 0),
        createdAt: DateTime(2026, 7, 1),
        updatedAt: DateTime(2026, 7, 1),
      );

      final json = original.toJson();
      final restored = BroadcastModel.fromJson(json);

      expect(restored.id, original.id);
      expect(restored.name, original.name);
      expect(restored.status, original.status);
      expect(restored.scheduledAt?.toIso8601String(), original.scheduledAt?.toIso8601String());
    });
  });

  group('BroadcastModel tableName', () {
    test('tableName is broadcasts', () {
      expect(BroadcastModel.tableName, 'broadcasts');
    });
  });
}
