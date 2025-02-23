/**
 * System for displaying temporary notifications in the UI
 * @class
 */
export class NotificationSystem {
  /**
   * Displays a notification message
   * @param {string} message - The message to display
   * @param {string} [type="info"] - The type of notification ('info', 'error', 'warning')
   *
   * @example
   * // Display an info notification
   * NotificationSystem.notify("Operation completed successfully");
   *
   * @example
   * // Display an error notification
   * NotificationSystem.notify("Failed to load widget", "error");
   *
   * @example
   * // Display a warning notification
   * NotificationSystem.notify("Widget initialization delayed", "warning");
   */
  static notify(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `widget-notification widget-notification-${type}`;
    notification.textContent = message;

    // Add animation class
    notification.style.animation = "slide-in 0.3s ease";

    document.body.appendChild(notification);

    // Fade out and remove
    setTimeout(() => {
      notification.style.animation = "slide-in 0.3s ease reverse";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

/**
 * Notification system styles
 * @private
 */
const styles = `
    .widget-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 4px;
        color: white;
        z-index: 1000;
    }
    .widget-notification-error {
        background: #ff4444;
    }
    .widget-notification-warning {
        background: #ffbb33;
    }
    .widget-notification-info {
        background: #33b5e5;
    }
`;

/**
 * Inject notification styles into the document
 * @private
 */
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
