import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../../ui/app_button.dart';

class ErrorView extends StatelessWidget {
  final String message;
  final String? actionLabel;
  final VoidCallback? onRetry;

  const ErrorView({
    super.key,
    required this.message,
    this.actionLabel,
    this.onRetry,
  });

  factory ErrorView.network({VoidCallback? onRetry}) {
    return ErrorView(
      message: 'No internet connection. Check your network and try again.',
      actionLabel: 'Retry Now',
      onRetry: onRetry,
    );
  }

  factory ErrorView.server({VoidCallback? onRetry}) {
    return ErrorView(
      message: 'Something went wrong on our end. Please try again.',
      actionLabel: 'Retry Now',
      onRetry: onRetry,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: isDark ? AppColors.surface : AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: (isDark ? AppColors.error : AppColors.error).withValues(alpha: 0.15),
              width: 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline_rounded,
                  size: 40,
                  color: AppColors.error,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Action Failed',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
              ),
              if (onRetry != null) ...[
                const SizedBox(height: 24),
                AppButton(
                  label: actionLabel ?? 'Try Again',
                  onPressed: onRetry!,
                  variant: AppButtonVariant.outlined,
                  icon: Icons.refresh_rounded,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

