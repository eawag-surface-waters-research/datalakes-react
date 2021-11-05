export const generateColorHEX = (colorStart, colorEnd, colorCount) => {
  function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  }

  /* Convert an RGB triplet to a hex string */
  function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  }

  /* Remove '#' in color hex string */
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }

  /* Convert a hex string to an RGB triplet */
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    return color;
  }

  // The beginning of your gradient
  var start = convertToRGB(colorStart);

  // The end of your gradient
  var end = convertToRGB(colorEnd);

  // The number of colors to compute
  var len = colorCount - 2;

  //Alpha blending amount
  var alpha = 0.0;

  var saida = [colorStart];

  for (var i = 0; i < len; i++) {
    var c = [];
    alpha += 1.0 / len;

    c[0] = end[0] * alpha + (1 - alpha) * start[0];
    c[1] = end[1] * alpha + (1 - alpha) * start[1];
    c[2] = end[2] * alpha + (1 - alpha) * start[2];

    saida.push(convertToHex(c));
  }
  saida.push(colorEnd);

  return saida;
};

export const generateColorRGB = (colorStart, colorEnd, colorCount) => {
  /* Remove '#' in color hex string */
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }

  /* Convert a hex string to an RGB triplet */
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    return color;
  }

  // The beginning of your gradient
  var start = convertToRGB(colorStart);

  // The end of your gradient
  var end = convertToRGB(colorEnd);

  // The number of colors to compute
  var len = colorCount - 2;

  //Alpha blending amount
  var alpha = 0.0;

  var saida = ["rgb(" + start[0] + "," + start[1] + "," + start[2] + ")"];

  for (var i = 0; i < len; i++) {
    var c = [];
    alpha += 1.0 / len;

    c[0] = end[0] * alpha + (1 - alpha) * start[0];
    c[1] = end[1] * alpha + (1 - alpha) * start[1];
    c[2] = end[2] * alpha + (1 - alpha) * start[2];

    var rgb = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";

    saida.push(rgb);
  }
  saida.push("rgb(" + end[0] + "," + end[1] + "," + end[2] + ")");

  return saida;
};

export const getColor = (value, min, max, colors) => {
  function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  }
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    return color;
  }
  function convertToHex(rgb) {
    return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  }

  if (value === null || isNaN(value)) {
    return "#ffffff";
  }
  if (value > max) {
    return colors[colors.length - 1].color;
  }
  if (value < min) {
    return colors[0].color;
  }
  var loc = (value - min) / (max - min);
  if (loc < 0 || loc > 1) {
    return "#fff";
  } else {
    var index = 0;
    for (var i = 0; i < colors.length - 1; i++) {
      if (loc >= colors[i].point && loc <= colors[i + 1].point) {
        index = i;
      }
    }
    var color1 = convertToRGB(colors[index].color);
    var color2 = convertToRGB(colors[index + 1].color);

    var f =
      (loc - colors[index].point) /
      (colors[index + 1].point - colors[index].point);
    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
    ];

    return `#${convertToHex(rgb)}`;
  }
};

export const convertToRGB = (hex) => {
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }
  var color = [];
  color[0] = parseInt(trim(hex).substring(0, 2), 16);
  color[1] = parseInt(trim(hex).substring(2, 4), 16);
  color[2] = parseInt(trim(hex).substring(4, 6), 16);
  color[3] = 255;
  return color;
};

export const getRGBAColor = (value, min, max, colors) => {
  if (value === null || isNaN(value)) {
    return [255, 255, 255, 0];
  }
  if (value > max) {
    return [0, 0, 0, 0];
  }
  if (value < min) {
    return [0, 0, 0, 0];
  }
  var loc = (value - min) / (max - min);
  if (loc < 0 || loc > 1) {
    return [255, 255, 255, 0];
  } else {
    var index = 0;
    for (var i = 0; i < colors.length - 1; i++) {
      if (loc >= colors[i].point && loc <= colors[i + 1].point) {
        index = i;
        break;
      }
    }
    var color1 = colors[index].rgba;
    var color2 = colors[index + 1].rgba;

    var f =
      (loc - colors[index].point) /
      (colors[index + 1].point - colors[index].point);
    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
      255,
    ];

    return rgb;
  }
};

export const getHexColor = (value, min, max, colors) => {
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }
  function hex(c) {
    var s = "0123456789abcdef";
    var i = parseInt(c, 10);
    if (i === 0 || isNaN(c)) return "00";
    i = Math.round(Math.min(Math.max(0, i), 255));
    return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
  }
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    color[3] = 255;
    return color;
  }

  function convertToHex(rgb) {
    return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
  }

  if (value === null || isNaN(value)) {
    return [255, 255, 255, 0];
  }
  if (value > max) {
    return convertToRGB(colors[colors.length - 1].color);
  }
  if (value < min) {
    return convertToRGB(colors[0].color);
  }
  var loc = (value - min) / (max - min);
  if (loc < 0 || loc > 1) {
    return [255, 255, 255, 0];
  } else {
    var index = 0;
    for (var i = 0; i < colors.length - 1; i++) {
      if (loc >= colors[i].point && loc <= colors[i + 1].point) {
        index = i;
      }
    }
    var color1 = convertToRGB(colors[index].color);
    var color2 = convertToRGB(colors[index + 1].color);

    var f =
      (loc - colors[index].point) /
      (colors[index + 1].point - colors[index].point);
    var rgb = [
      color1[0] + (color2[0] - color1[0]) * f,
      color1[1] + (color2[1] - color1[1]) * f,
      color1[2] + (color2[2] - color1[2]) * f,
      255,
    ];

    return convertToHex(rgb);
  }
};

export const getBinaryColor = (value, min, max, colors) => {
  function trim(s) {
    return s.charAt(0) === "#" ? s.substring(1, 7) : s;
  }
  function convertToRGB(hex) {
    var color = [];
    color[0] = parseInt(trim(hex).substring(0, 2), 16);
    color[1] = parseInt(trim(hex).substring(2, 4), 16);
    color[2] = parseInt(trim(hex).substring(4, 6), 16);
    color[3] = 255;
    return color;
  }
  if (value === null || isNaN(value)) {
    return [255, 255, 255, 0];
  }
  if (value > max) {
    return convertToRGB(colors[colors.length - 1].color);
  }
  if (value < min) {
    return convertToRGB(colors[0].color);
  }
  var loc = (value - min) / (max - min);
  if (loc < 0 || loc > 1) {
    return [255, 255, 255, 0];
  } else {
    var index = 0;
    for (var i = 0; i < colors.length - 1; i++) {
      if (loc >= colors[i].point && loc <= colors[i + 1].point) {
        index = i;
      }
    }
    var color1 = convertToRGB(colors[index].color);
    var color2 = convertToRGB(colors[index + 1].color);

    var f =
      (loc - colors[index].point) /
      (colors[index + 1].point - colors[index].point);
    var rgb = [
      (color1[0] + (color2[0] - color1[0]) * f) / 255,
      (color1[1] + (color2[1] - color1[1]) * f) / 255,
      (color1[2] + (color2[2] - color1[2]) * f) / 255,
      1,
    ];

    return rgb;
  }
};
