import {
  extent,
  timeFormat,
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeMonth,
  timeYear,
  timeWeek,
  range,
} from "d3";
import { contours } from "d3-contour";

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

export const convertToHex = (rgb) => {
  return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
};

const hex = (c) => {
  var s = "0123456789abcdef";
  var i = parseInt(c, 10);
  if (i === 0 || isNaN(c)) return "00";
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - (i % 16)) / 16) + s.charAt(i % 16);
};

export const getRGBAColor = (value, min, max, colors, colorCache) => {
  if (value === null || isNaN(value)) return [255, 255, 255, 0];
  if (value < min || value > max) return [0, 0, 0, 0];
  const cacheKey = `${value}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey);
  }
  const range = max - min;
  const loc = (value - min) / range;
  if (loc < 0 || loc > 1) {
    colorCache.set(cacheKey, [255, 255, 255, 0]);
    return [255, 255, 255, 0];
  }
  let low = 0;
  let high = colors.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (loc < colors[mid].point) {
      high = mid - 1;
    } else if (loc > colors[mid + 1].point) {
      low = mid + 1;
    } else {
      low = mid;
      break;
    }
  }
  const index = low;
  const { rgba: color1 } = colors[index];
  const { rgba: color2 } = colors[index + 1];
  const factor =
    (loc - colors[index].point) /
    (colors[index + 1].point - colors[index].point);
  const rgb = [
    color1[0] + (color2[0] - color1[0]) * factor,
    color1[1] + (color2[1] - color1[1]) * factor,
    color1[2] + (color2[2] - color1[2]) * factor,
    255,
  ];
  colorCache.set(cacheKey, rgb);
  return rgb;
};

export const closest = (num, arr) => {
  var curr = 0;
  var diff = Math.abs(num - arr[curr]);
  for (var val = 0; val < arr.length; val++) {
    var newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = val;
    }
  }
  return curr;
};

export const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

export const indexOfClosest = (num, arr) => {
  if (!isNumeric(num)) {
    return false;
  }
  arr = arr.filter((a) => isNumeric(a));
  var index = 0;
  var diff = Math.abs(num - arr[0]);
  for (var val = 0; val < arr.length; val++) {
    var newdiff = Math.abs(num - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      index = val;
    }
  }
  return index;
};

export const getFileIndex = (scales, p) => {
  for (var i = 0; i < scales.length; i++) {
    if (p >= Math.min(...scales[i]) && p <= Math.max(...scales[i])) {
      return i;
    }
  }
  return NaN;
};

export const formatDate = (a, lang) => {
  var months = lang.shortMonths;
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  return `${hour < 10 ? "0" + hour : hour}:${
    min < 10 ? "0" + min : min
  } ${date} ${month} ${String(year).slice(-2)}`;
};

export const formatNumber = (num, decimals = 3) => {
  num = parseFloat(num);
  var fact = 10 ** Math.round(parseFloat(decimals));
  if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
    num = num.toExponential(decimals);
  } else {
    num = Math.round(num * fact) / fact;
  }
  return num;
};

export const languageOptions = (name) => {
  var lang = {
    de: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["€", ""],
      dateTime: "%a %b %e %X %Y",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["Vormittag", "Nachmittag"],
      days: [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
      ],
      shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      months: [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ],
      shortMonths: [
        "Jan",
        "Feb",
        "Mär",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Okt",
        "Nov",
        "Dez",
      ],
    },
    en: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["€", ""],
      dateTime: "%a %b %e %X %Y",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      shortDays: ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"],
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      shortMonths: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    fr: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["€", ""],
      dateTime: "%a %b %e %X %Y",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ],
      shortDays: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
      months: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
      ],
      shortMonths: [
        "Janv",
        "Févr",
        "Mars",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sept",
        "Oct",
        "Nov",
        "Déc",
      ],
    },
    es: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["€", ""],
      dateTime: "%a %b %e %X %Y",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ],
      shortDays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
      months: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      shortMonths: [
        "Enero",
        "Feb",
        "Mar",
        "Abr",
        "Mayo",
        "Jun",
        "Jul",
        "Agosto",
        "Sept",
        "Oct",
        "Nov",
        "Dic",
      ],
    },
    it: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["€", ""],
      dateTime: "%a %b %e %X %Y",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: [
        "Domenica",
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
      ],
      shortDays: ["Do", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
      months: [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre",
      ],
      shortMonths: [
        "Genn",
        "Febbr",
        "Mar",
        "Apr",
        "Magg",
        "Giugno",
        "Luglio",
        "Ag",
        "Sett",
        "Ott",
        "Nov",
        "Dic",
      ],
    },
  };
  if (name in lang) {
    return lang[name];
  } else {
    console.error("Language: " + name + " not recognised.");
    return lang["en"];
  }
};

export const scientificNotation = (min, max) => {
  return (min > -0.0001 && max < 0.0001) || min < -10000 || max > 10000;
};

export const getDomain = (domain) => {
  var minarr = domain.map((d) => d[0]);
  var maxarr = domain.map((d) => d[1]);
  var min = extent(minarr)[0];
  var max = extent(maxarr)[1];
  return [min, max];
};

export const multiFormat = (date) => {
  var formatMillisecond = timeFormat(".%L"),
    formatSecond = timeFormat(":%S"),
    formatMinute = timeFormat("%H:%M"),
    formatHour = timeFormat("%H:%M"),
    formatDay = timeFormat("%d.%m"),
    formatWeek = timeFormat("%d.%m"),
    formatMonth = timeFormat("%B"),
    formatYear = timeFormat("%Y");
  return (
    timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
      ? formatMinute
      : timeDay(date) < date
      ? formatHour
      : timeMonth(date) < date
      ? timeWeek(date) < date
        ? formatDay
        : formatWeek
      : timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
};

export const replaceNull = (data, zMin, factor = 9999) => {
  var nullData = JSON.parse(JSON.stringify(data));
  for (var i = 0; i < data.length; i++) {
    for (var y = 1; y < data[i].z.length - 1; y++) {
      for (var x = 1; x < data[i].z[y].length - 1; x++) {
        if (data[i].z[y][x] === null || !isNumeric(data[i].z[y][x])) {
          if (data[i].z[y][x] !== null) data[i].z[y][x] = null;
          nullData[i].z[y][x] = -Math.abs(zMin * factor);
        }
      }
    }
  }
  return nullData;
};

export const autoDownSample = (arr, ads) => {
  var l1 = arr.z.length;
  var l2 = arr.z[0].length;
  if (l1 <= ads && l2 <= ads) {
    return arr;
  } else {
    var d1 = Math.max(1, Math.floor(l1 / ads));
    var d2 = Math.max(1, Math.floor(l2 / ads));
    var z_ds = [];
    var y_ds = [];
    for (let i = 0; i < l1; i = i + d1) {
      let zz_ds = [];
      var x_ds = [];
      for (let j = 0; j < l2; j = j + d2) {
        zz_ds.push(arr.z[i][j]);
        x_ds.push(arr.x[j]);
      }
      y_ds.push(arr.y[i]);
      z_ds.push(zz_ds);
    }
    return { x: x_ds, y: y_ds, z: z_ds };
  }
};

export const prepareContours = (zMin, zMax, data, thresholdStep) => {
  const step = (zMax - zMin) / thresholdStep;
  const thresholds = range(zMin - step, zMax, step);
  const contour = [];
  for (let i = 0; i < data.length; i++) {
    let c = contours().size([data[i].z[0].length, data[i].z.length]);
    const nullValues = data[i].z.flat();
    contour.push(c.thresholds(thresholds)(nullValues));
  }
  return { contour, step };
};
