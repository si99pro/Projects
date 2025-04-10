// src/utils/colors.js (or place inside your component/context if preferred)

// A selection of Material Design primary color hex codes (mostly 500/700 shades)
const materialColors = [
    '#F44336', // Red 500
    '#E91E63', // Pink 500
    '#9C27B0', // Purple 500
    '#673AB7', // Deep Purple 500
    '#3F51B5', // Indigo 500
    '#2196F3', // Blue 500
    '#03A9F4', // Light Blue 500
    '#00BCD4', // Cyan 500
    '#009688', // Teal 500
    '#4CAF50', // Green 500
    '#8BC34A', // Light Green 500
    '#CDDC39', // Lime 500
    '#FBC02D', // Yellow 700 (500 might be too light)
    '#FFC107', // Amber 500
    '#FF9800', // Orange 500
    '#FF5722', // Deep Orange 500
    '#795548', // Brown 500
    '#607D8B', // Blue Grey 500
  ];
  
  /**
   * Selects a random color hex code from the materialColors array.
   * @returns {string} A random Material Design color hex code.
   */
  export const getRandomMaterialColor = () => {
    const randomIndex = Math.floor(Math.random() * materialColors.length);
    return materialColors[randomIndex];
  };