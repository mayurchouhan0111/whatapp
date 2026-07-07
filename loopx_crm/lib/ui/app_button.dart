import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

enum AppButtonVariant { filled, outlined, text, gradient }

class AppButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.filled,
    this.isLoading = false,
    this.icon,
  });

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 80),
      lowerBound: 0.0,
      upperBound: 0.05,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Color _backgroundColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (widget.variant) {
      case AppButtonVariant.filled:
        return AppColors.primary;
      case AppButtonVariant.outlined:
        return isDark ? AppColors.surface2.withValues(alpha: 0.3) : AppColors.surface2Light.withValues(alpha: 0.3);
      case AppButtonVariant.gradient:
      case AppButtonVariant.text:
        return Colors.transparent;
    }
  }

  Color _foregroundColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (widget.variant) {
      case AppButtonVariant.filled:
      case AppButtonVariant.gradient:
        return Colors.white;
      case AppButtonVariant.outlined:
        return isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
      case AppButtonVariant.text:
        return isDark ? AppColors.primaryLight : AppColors.primary;
    }
  }

  BorderSide _borderSide(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    switch (widget.variant) {
      case AppButtonVariant.filled:
      case AppButtonVariant.gradient:
      case AppButtonVariant.text:
        return BorderSide.none;
      case AppButtonVariant.outlined:
        return BorderSide(color: isDark ? AppColors.border : AppColors.borderLight, width: 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bg = _backgroundColor(context);
    final fg = _foregroundColor(context);
    final border = _borderSide(context);

    Widget buttonContent = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (widget.isLoading) ...[
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: fg,
            ),
          ),
          const SizedBox(width: 8),
        ] else if (widget.icon != null) ...[
          Icon(widget.icon, size: 16, color: fg),
          const SizedBox(width: 8),
        ],
        Text(
          widget.label,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
      ],
    );

    return GestureDetector(
      onTapDown: (_) {
        if (!widget.isLoading) _controller.forward();
      },
      onTapUp: (_) {
        if (!widget.isLoading) _controller.reverse();
      },
      onTapCancel: () {
        if (!widget.isLoading) _controller.reverse();
      },
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        ),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: widget.variant == AppButtonVariant.gradient ? AppColors.primaryGradient : null,
          ),
          child: ElevatedButton(
            onPressed: widget.isLoading ? null : widget.onPressed,
            style: ElevatedButton.styleFrom(
              backgroundColor: bg,
              foregroundColor: fg,
              disabledBackgroundColor: bg.withValues(alpha: 0.5),
              disabledForegroundColor: fg.withValues(alpha: 0.5),
              elevation: 0,
              shadowColor: Colors.transparent,
              side: border,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            child: buttonContent,
          ),
        ),
      ),
    );
  }
}

