

export default class FormatType {

    static get BOOLEAN() {
        return {
            CHECKMARK_ICON: 'checkmark_icon', // uses standard check anx x for boolean display
            YES_NO_TEXT: 'yes_no_text', // uses "Yes" and "No" text for boolean display
        };
    }

    static get DATE() {
        return {
            FULL_TEXT: 'full_text', // e.g. January 1, 2024
            ABBREVIATED_TEXT: 'abbreviated_text', // e.g. Jan 1, 2024
            US_NUMERIC: 'us_numeric', // e.g. 01/01/2024
            ISO: 'iso', // e.g. 2024-01-01
        };
    }

    static get TIME() {
        return {
            HOUR_12: 'hour_12', // e.g. 1:00 PM
            HOUR_24: 'hour_24', // e.g. 13:00
        };
    }
}