import { appendTo, createElement } from "../util/element-assembler";

type NotificationType = 'info' | 'warning' | 'error';

let notificationList = [];

/**
 * Function for showing a notification to the user.
 * @param message - The message to show in the notification
 * @param type    - The type of notification to show
 */
export function notify(message: string, type: NotificationType = 'info')
{
    let notificationElement = createElement('div', ['notification', `notification-${type}`], [
        createElement('span', ['icon', `notification-icon-${type}`]),
        createElement('span', [], [], { textContent: message })
    ]);

    let previousElements = document.getElementsByClassName('notification');
    appendTo(document.body, notificationElement);

    notificationElement.style.top = `${window.innerHeight - previousElements.length * 50}px`;

    setTimeout(() => notificationElement.remove(), 5000);
}