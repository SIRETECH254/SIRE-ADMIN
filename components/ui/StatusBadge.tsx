import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Define the icon size
const ICON_SIZE = 12;

interface StatusBadgeProps {
  status: string | boolean;
  type?: string;
  className?: string;
}

/**
 * StatusBadge component for displaying status badges with icons
 *
 * @param {string|boolean} status - The status string or boolean
 * @param {string} [type] - The type of badge (e.g., 'invoice-status', 'user-role')
 * @param {string} [className] - Optional additional className
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  className = '',
}) => {
  /**
   * Get icon component based on status and type
   */
  const getIcon = (status: string | boolean, badgeType?: string) => {
    if (!badgeType) {
      return null;
    }

    const upperStatus =
      typeof status === 'string'
        ? status.toUpperCase()
        : String(status).toUpperCase();

    switch (badgeType) {
      case 'service-status':
        switch (upperStatus) {
          case 'ACTIVE':
          case 'TRUE':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'INACTIVE':
          case 'FALSE':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          case 'DRAFT':
            return <Feather name="edit" size={ICON_SIZE} />;
          case 'ARCHIVED':
            return <Feather name="archive" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'user-status':
      case 'client-status':
      case 'role-status':
        switch (upperStatus) {
          case 'ACTIVE':
          case 'TRUE':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'INACTIVE':
          case 'FALSE':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          case 'VERIFIED':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'UNVERIFIED':
            return <Feather name="clock" size={ICON_SIZE} />;
          case 'ADMIN':
            return <Feather name="shield" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'verification-status':
        switch (upperStatus) {
          case 'VERIFIED':
          case 'TRUE':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'UNVERIFIED':
          case 'FALSE':
            return <Feather name="alert-circle" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'review-status':
      case 'approval-status':
        switch (upperStatus) {
          case 'APPROVED':
          case 'TRUE':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'PENDING':
          case 'FALSE':
            return <Feather name="clock" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'publish-status':
        switch (upperStatus) {
          case 'PUBLISHED':
          case 'TRUE':
            return <Feather name="globe" size={ICON_SIZE} />;
          case 'UNPUBLISHED':
          case 'FALSE':
            return <Feather name="lock" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'invoice-status':
        switch (upperStatus) {
          case 'DRAFT':
            return <Feather name="file-text" size={ICON_SIZE} />;
          case 'SENT':
            return <Feather name="send" size={ICON_SIZE} />;
          case 'PENDING':
            return <Feather name="clock" size={ICON_SIZE} />;
          case 'PAID':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'PARTIALLY_PAID':
            return <Feather name="pie-chart" size={ICON_SIZE} />;
          case 'OVERDUE':
            return <Feather name="alert-circle" size={ICON_SIZE} />;
          case 'CANCELLED':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'payment-status':
        switch (upperStatus) {
          case 'UNPAID':
            return <Feather name="dollar-sign" size={ICON_SIZE} />;
          case 'PENDING':
            return <Feather name="clock" size={ICON_SIZE} />;
          case 'PROCESSING':
            return <Feather name="loader" size={ICON_SIZE} />;
          case 'PAID':
          case 'COMPLETED':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'PARTIALLY_REFUNDED':
            return <Feather name="rotate-ccw" size={ICON_SIZE} />;
          case 'REFUNDED':
            return <Feather name="rotate-ccw" size={ICON_SIZE} />;
          case 'FAILED':
            return <Feather name="alert-triangle" size={ICON_SIZE} />;
          case 'CANCELLED':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'quotation-status':
        switch (upperStatus) {
          case 'DRAFT':
            return <Feather name="file-text" size={ICON_SIZE} />;
          case 'PENDING':
            return <Feather name="clock" size={ICON_SIZE} />;
          case 'SENT':
            return <Feather name="send" size={ICON_SIZE} />;
          case 'ACCEPTED':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'REJECTED':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          case 'CONVERTED':
            return <Feather name="check-square" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'project-status':
        switch (upperStatus) {
          case 'PENDING':
            return <Feather name="clock" size={ICON_SIZE} />;
          case 'IN_PROGRESS':
            return <Feather name="play-circle" size={ICON_SIZE} />;
          case 'ON_HOLD':
            return <Feather name="pause-circle" size={ICON_SIZE} />;
          case 'COMPLETED':
            return <Feather name="check-circle" size={ICON_SIZE} />;
          case 'CANCELLED':
            return <Feather name="x-circle" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'priority-status':
        switch (upperStatus) {
          case 'URGENT':
            return <Feather name="alert-octagon" size={ICON_SIZE} />;
          case 'HIGH':
            return <Feather name="arrow-up" size={ICON_SIZE} />;
          case 'MEDIUM':
            return <Feather name="minus" size={ICON_SIZE} />;
          case 'LOW':
            return <Feather name="arrow-down" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'contact-status':
        switch (upperStatus) {
          case 'UNREAD':
            return <Feather name="mail" size={ICON_SIZE} />;
          case 'READ':
            return <Feather name="mail" size={ICON_SIZE} />;
          case 'REPLIED':
            return <Feather name="corner-up-left" size={ICON_SIZE} />;
          case 'ARCHIVED':
            return <Feather name="archive" size={ICON_SIZE} />;
          default:
            return <Feather name="help-circle" size={ICON_SIZE} />;
        }

      case 'user-role':
        switch (upperStatus) {
          case 'SUPER_ADMIN':
            return <Feather name="shield" size={ICON_SIZE} />;
          case 'ADMIN':
            return <Feather name="shield" size={ICON_SIZE} />;
          case 'FINANCE':
            return <Feather name="dollar-sign" size={ICON_SIZE} />;
          case 'PROJECT_MANAGER':
            return <Feather name="briefcase" size={ICON_SIZE} />;
          case 'STAFF':
            return <Feather name="user" size={ICON_SIZE} />;
          case 'CLIENT':
            return <Feather name="users" size={ICON_SIZE} />;
          default:
            return <Feather name="user" size={ICON_SIZE} />;
        }

      case 'notification-category':
        switch (upperStatus) {
          case 'GENERAL':
            return <Feather name="bell" size={ICON_SIZE} />;
          case 'PROJECT':
            return <Feather name="briefcase" size={ICON_SIZE} />;
          case 'INVOICE':
            return <Feather name="file-text" size={ICON_SIZE} />;
          case 'PAYMENT':
            return <Feather name="credit-card" size={ICON_SIZE} />;
          case 'QUOTATION':
            return <Feather name="file" size={ICON_SIZE} />;
          default:
            return <Feather name="bell" size={ICON_SIZE} />;
        }

      default:
        return <Feather name="help-circle" size={ICON_SIZE} />;
    }
  };

  /**
   * Get status variant (background and text colors) based on status and type
   */
  const getStatusVariant = (status: string | boolean, badgeType?: string) => {
    // Backward compatibility: use simple logic if no type provided
    if (!badgeType) {
      const statusLower = (
        typeof status === 'string' ? status : String(status)
      ).toLowerCase();
      switch (statusLower) {
        case 'active':
          return {
            bg: 'bg-green-100',
            text: 'text-green-800',
            iconColor: '#16A34A',
          };
        case 'inactive':
          return {
            bg: 'bg-red-100',
            text: 'text-red-800',
            iconColor: '#DC2626',
          };
        case 'expired':
          return {
            bg: 'bg-red-100',
            text: 'text-red-800',
            iconColor: '#DC2626',
          };
        case 'limit-reached':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            iconColor: '#EA580C',
          };
        default:
          return {
            bg: 'bg-indigo-100',
            text: 'text-indigo-800',
            iconColor: '#4F46E5',
          };
      }
    }

    const upperStatus =
      typeof status === 'string'
        ? status.toUpperCase()
        : String(status).toUpperCase();

    // Reusable styles
    const styles = {
      success: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        iconColor: '#16A34A',
      },
      error: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        iconColor: '#DC2626',
      },
      warning: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        iconColor: '#CA8A04',
      },
      info: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        iconColor: '#2563EB',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        iconColor: '#EA580C',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        iconColor: '#7C3AED',
      },
      sky: {
        bg: 'bg-sky-100',
        text: 'text-sky-800',
        iconColor: '#0284C7',
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        iconColor: '#4F46E5',
      },
      rose: {
        bg: 'bg-rose-100',
        text: 'text-rose-700',
        iconColor: '#E11D48',
      },
      default: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        iconColor: '#4F46E5',
      },
    };

    if (badgeType === 'service-status') {
      switch (upperStatus) {
        case 'ACTIVE':
        case 'TRUE':
          return styles.success;
        case 'DRAFT':
          return styles.warning;
        case 'ARCHIVED':
          return styles.default;
        default:
          return styles.default;
      }
    }

    if (
      badgeType === 'user-status' ||
      badgeType === 'client-status' ||
      badgeType === 'role-status'
    ) {
      switch (upperStatus) {
        case 'ACTIVE':
        case 'TRUE':
          return styles.success;
        case 'INACTIVE':
        case 'FALSE':
          return styles.error;
        case 'VERIFIED':
          return styles.info;
        case 'UNVERIFIED':
          return styles.default;
        case 'ADMIN':
          return styles.purple;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'verification-status') {
      switch (upperStatus) {
        case 'VERIFIED':
        case 'TRUE':
          return styles.success;
        case 'UNVERIFIED':
        case 'FALSE':
          return styles.warning;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'review-status' || badgeType === 'approval-status') {
      switch (upperStatus) {
        case 'APPROVED':
        case 'TRUE':
          return styles.success;
        case 'PENDING':
        case 'FALSE':
          return styles.warning;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'publish-status') {
      switch (upperStatus) {
        case 'PUBLISHED':
        case 'TRUE':
          return styles.info;
        case 'UNPUBLISHED':
        case 'FALSE':
          return styles.default;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'invoice-status') {
      switch (upperStatus) {
        case 'DRAFT':
          return styles.default;
        case 'SENT':
          return styles.info;
        case 'PENDING':
          return styles.warning;
        case 'PAID':
          return styles.success;
        case 'PARTIALLY_PAID':
          return styles.orange;
        case 'OVERDUE':
          return styles.error;
        case 'CANCELLED':
          return styles.error;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'payment-status') {
      switch (upperStatus) {
        case 'UNPAID':
          return {
            bg: 'bg-violet-100',
            text: 'text-violet-800',
            iconColor: '#7C3AED',
          };
        case 'PENDING':
          return styles.warning;
        case 'PROCESSING':
          return styles.info;
        case 'PAID':
        case 'COMPLETED':
          return styles.success;
        case 'PARTIALLY_REFUNDED':
          return styles.orange;
        case 'REFUNDED':
          return styles.error;
        case 'FAILED':
          return styles.error;
        case 'CANCELLED':
          return styles.error;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'quotation-status') {
      switch (upperStatus) {
        case 'DRAFT':
          return styles.default;
        case 'PENDING':
          return styles.warning;
        case 'SENT':
          return styles.info;
        case 'ACCEPTED':
          return styles.success;
        case 'REJECTED':
          return styles.error;
        case 'CONVERTED':
          return {
            bg: 'bg-indigo-100',
            text: 'text-indigo-700',
            iconColor: '#4F46E5',
          };
        default:
          return styles.default;
      }
    }

    if (badgeType === 'project-status') {
      switch (upperStatus) {
        case 'PENDING':
          return styles.default;
        case 'IN_PROGRESS':
          return styles.info;
        case 'ON_HOLD':
          return styles.warning;
        case 'COMPLETED':
          return styles.success;
        case 'CANCELLED':
          return styles.error;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'priority-status') {
      switch (upperStatus) {
        case 'URGENT':
          return styles.error;
        case 'HIGH':
          return styles.warning;
        case 'MEDIUM':
          return styles.info;
        case 'LOW':
          return styles.default;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'contact-status') {
      switch (upperStatus) {
        case 'UNREAD':
          return styles.error;
        case 'READ':
          return styles.default;
        case 'REPLIED':
          return styles.success;
        case 'ARCHIVED':
          return styles.info;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'user-role') {
      switch (upperStatus) {
        case 'SUPER_ADMIN':
          return styles.purple;
        case 'ADMIN':
          return styles.purple;
        case 'FINANCE':
          return {
            bg: 'bg-violet-100',
            text: 'text-violet-800',
            iconColor: '#7C3AED',
          };
        case 'PROJECT_MANAGER':
          return styles.info;
        case 'STAFF':
          return styles.default;
        case 'CLIENT':
          return styles.success;
        default:
          return styles.default;
      }
    }

    if (badgeType === 'notification-category') {
      switch (upperStatus) {
        case 'GENERAL':
          return styles.default;
        case 'PROJECT':
          return styles.info;
        case 'INVOICE':
          return styles.warning;
        case 'PAYMENT':
          return styles.success;
        case 'QUOTATION':
          return styles.info;
        default:
          return styles.default;
      }
    }

    return styles.default;
  };

  /**
   * Format status text for display
   */
  const formatStatus = (status: string | boolean, badgeType?: string) => {
    // Backward compatibility: use simple formatting if no type provided
    if (!badgeType) {
      const statusLower = (
        typeof status === 'string' ? status : String(status)
      ).toLowerCase();
      switch (statusLower) {
        case 'active':
          return 'Active';
        case 'inactive':
          return 'Inactive';
        case 'expired':
          return 'Expired';
        case 'limit-reached':
          return 'Limit Reached';
        default:
          return typeof status === 'string' ? status : 'Unknown';
      }
    }

    // Handle boolean values
    if (typeof status === 'boolean') {
      if (
        badgeType === 'user-status' ||
        badgeType === 'client-status' ||
        badgeType === 'role-status' ||
        badgeType === 'service-status'
      ) {
        return status ? 'Active' : 'Inactive';
      }
      if (badgeType === 'review-status' || badgeType === 'approval-status') {
        return status ? 'Approved' : 'Pending';
      }
      if (badgeType === 'publish-status') {
        return status ? 'Published' : 'Unpublished';
      }
      if (badgeType === 'verification-status') {
        return status ? 'Verified' : 'Unverified';
      }
    }

    const upperStatus =
      typeof status === 'string'
        ? status.toUpperCase()
        : String(status).toUpperCase();
    const statusStr = typeof status === 'string' ? status : String(status);

    if (badgeType === 'payment-status') {
      switch (upperStatus) {
        case 'UNPAID':
          return 'Unpaid';
        case 'PENDING':
          return 'Pending';
        case 'PROCESSING':
          return 'Processing';
        case 'PAID':
          return 'Paid';
        case 'COMPLETED':
          return 'Completed';
        case 'PARTIALLY_REFUNDED':
          return 'Partially Refunded';
        case 'REFUNDED':
          return 'Refunded';
        case 'FAILED':
          return 'Failed';
        case 'CANCELLED':
          return 'Cancelled';
        default:
          return (
            statusStr.charAt(0).toUpperCase() +
            statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
          );
      }
    }

    if (badgeType === 'invoice-status') {
      switch (upperStatus) {
        case 'PARTIALLY_PAID':
          return 'Partially Paid';
        default:
          return (
            statusStr.charAt(0).toUpperCase() +
            statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
          );
      }
    }

    if (badgeType === 'project-status') {
      switch (upperStatus) {
        case 'IN_PROGRESS':
          return 'In Progress';
        case 'ON_HOLD':
          return 'On Hold';
        default:
          return (
            statusStr.charAt(0).toUpperCase() +
            statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
          );
      }
    }

    if (badgeType === 'user-role') {
      switch (upperStatus) {
        case 'SUPER_ADMIN':
          return 'Super Admin';
        case 'PROJECT_MANAGER':
          return 'Project Manager';
        default:
          return (
            statusStr.charAt(0).toUpperCase() +
            statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
          );
      }
    }

    // Default formatting: Capitalize first letter, replace underscores
    return (
      statusStr.charAt(0).toUpperCase() +
      statusStr.slice(1).toLowerCase().replace(/_/g, ' ')
    );
  };

  const variant = getStatusVariant(status, type);
  const icon = getIcon(status, type);

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-0.5 self-start ${variant.bg} ${className}`}
    >
      {icon && (
        <View>
          {React.cloneElement(icon as React.ReactElement, {
            color: variant.iconColor,
          })}
        </View>
      )}
      <Text className={`text-xs font-medium ${variant.text}`}>
        {formatStatus(status, type)}
      </Text>
    </View>
  );
};

export default StatusBadge;
