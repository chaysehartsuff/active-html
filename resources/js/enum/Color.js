
/**
 * An enum-like class for storing and accessing a consistent color palette.
 * The colors are provided as static properties.
 *
 * Example: Color.RED returns '#FF0000'
 */
export default class Color {
    // Basic Colors
    static get BLACK() { return '#000000'; }
    static get WHITE() { return '#FFFFFF'; }
    static get RED() { return '#FF0000'; }
    static get GREEN() { return '#008000'; }
    static get LIGHT_GREEN() { return '#90EE90'; }
    static get BLUE() { return '#0000FF'; }
    static get YELLOW() { return '#FFFF00'; }
    static get ORANGE() { return '#FFA500'; }
    static get PURPLE() { return '#800080'; }
    static get CYAN() { return '#00FFFF'; }
    static get MAGENTA() { return '#FF00FF'; }
    static get PINK() { return '#FFC0CB'; }
    static get TEAL() { return '#008080'; }
    static get LIME() { return '#00FF00'; }
    static get BROWN() { return '#A52A2A'; }

    // Shades of Gray
    static get GRAY() { return '#808080'; }
    static get LIGHT_GRAY() { return '#D3D3D3'; }
    static get DARK_GRAY() { return '#A9A9A9'; }
    static get SILVER() { return '#C0C0C0'; }
    static get CHARCOAL() { return '#36454F'; }

    // Web Colors
    static get INDIGO() { return '#4B0082'; }
    static get GOLD() { return '#FFD700'; }
    static get NAVY() { return '#000080'; }
    static get CRIMSON() { return '#DC143C'; }
    static get AQUA() { return '#00FFFF'; }
}
