import '../../../../data/datasources/supabase_datasource.dart';
import '../../../data/models/conversation_model.dart';

class DashboardMetrics {
  final int activeConversations;
  final int newContactsToday;
  final double openDealsValue;
  final int openDealsCount;
  final int messagesSentToday;

  const DashboardMetrics({
    required this.activeConversations,
    required this.newContactsToday,
    required this.openDealsValue,
    required this.openDealsCount,
    required this.messagesSentToday,
  });
}

class DashboardRepositoryImpl {
  final SupabaseDataSource _dataSource;

  DashboardRepositoryImpl(this._dataSource);

  Future<DashboardMetrics> getMetrics() async {
    final todayStart = DateTime.now().toIso8601String();

    final openConvResponse = await _dataSource
        .from('conversations')
        .select('id')
        .eq('status', 'open')
        .count();
    final newContactsResponse = await _dataSource
        .from('contacts')
        .select('id')
        .gte('created_at', todayStart)
        .count();
    final messagesResponse = await _dataSource
        .from('messages')
        .select('id')
        .eq('sender_type', 'agent')
        .gte('created_at', todayStart)
        .count();
    final dealsData = await _dataSource
        .from('deals')
        .select('value, status')
        .eq('status', 'open');

    final openConvCount = openConvResponse.count;
    final newContactsCount = newContactsResponse.count;
    final messagesCount = messagesResponse.count;

    double dealsValue = 0;
    for (final d in dealsData) {
      dealsValue += (d['value'] as num?)?.toDouble() ?? 0;
    }

    return DashboardMetrics(
      activeConversations: openConvCount,
      newContactsToday: newContactsCount,
      openDealsValue: dealsValue,
      openDealsCount: dealsData.length,
      messagesSentToday: messagesCount,
    );
  }

  Future<List<ConversationModel>> getRecentConversations({int limit = 5}) async {
    final response = await _dataSource
        .from('conversations')
        .select('*, contact:contacts(*)')
        .order('last_message_at', ascending: false)
        .limit(limit);
    return (response as List)
        .map((e) => ConversationModel.fromJson(e))
        .toList();
  }
}
