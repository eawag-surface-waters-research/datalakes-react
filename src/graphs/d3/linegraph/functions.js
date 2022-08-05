export const closest = (data, hoverX, hoverY, xAxis, yAxis) => {
  var idx = 0;
  var idy = 0;
  var distance = Infinity;
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[i].x.length; j++) {
      let d =
        ((hoverX - xAxis[data[i].xaxis].ax(data[i].x[j])) ** 2 +
          (hoverY - yAxis[data[i].yaxis].ax(data[i].y[j])) ** 2) **
        0.5;
      if (d < distance) {
        idx = i;
        idy = j;
        distance = d;
      }
    }
  }
  return { idx, idy, distance };
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

export const formatNumber = (num) => {
  num = parseFloat(num);
  if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
    num = num.toExponential(3);
  } else {
    num = Math.round(num * 1000) / 1000;
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
      periods: ["AM", "PM"],
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
  return (min > -0.0001 && max < 0.0001) || (min < -10000 || max > 10000)
};
