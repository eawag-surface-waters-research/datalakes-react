export const interp2 = (x, y, z, type = "linear") => {
  if (z.length !== y.length) {
    throw new Error("y and z lengths do not match");
  }
  if (z[0].length !== x.length) {
    throw new Error("x and z lengths do not match");
  }
  if (z.flat().every(isNumeric)) {
    return { x, y, z };
  }

  if (type === "linear") {
    return linear(x, y, z);
  } else if (type === "x-linear") {
    return xlinear(x, y, z);
  } else if (type === "y-linear") {
    return ylinear(x, y, z);
  } else if (type === "x-nearest") {
    return xnearest(x, y, z);
  } else if (type === "y-nearest") {
    return ynearest(x, y, z);
  } else {
    throw new Error("Type " + type + " not recognised.");
  }
};

const linear = (x, y, z) => {
  return { x, y, z };
};

const xlinear = (x, y, z) => {
  for (let i = 0; i < y.length; i++) {
    z[i] = linearInterpolate(x, z[i]);
  }
  return { x, y, z };
};

const xnearest = (x, y, z) => {
  for (let i = 0; i < y.length; i++) {
    z[i] = nearestInterpolate(x, z[i]);
  }
  return { x, y, z };
};

const ylinear = (x, y, z) => {
  for (let i = 0; i < x.length; i++) {
    let arr = z.map((zz) => zz[i]);
    let iArr = linearInterpolate(y, arr);
    z = z.map((zz, index) => {
      zz[i] = iArr[index];
      return zz;
    });
  }
  return { x, y, z };
};

const ynearest = (x, y, z) => {
  for (let i = 0; i < x.length; i++) {
    let arr = z.map((zz) => zz[i]);
    let iArr = linearInterpolate(y, arr);
    z = z.map((zz, index) => {
      zz[i] = iArr[index];
      return zz;
    });
  }
  return { x, y, z };
};

const linearInterpolate = (x, y) => {
  if (y.every(isNumeric)) {
    return y;
  } else if (y.filter((yy) => isNumeric(yy)).length < 2) {
    return y;
  } else {
    // If first value null
    if (!isNumeric(y[0])) {
      let arr = [];
      for (let i = 1; i < y.length; i++) {
        if (arr.length > 0) {
          break;
        } else if (isNumeric(y[i])) {
          arr.push(i);
        }
      }
      y[0] = y[arr[0]];
    }

    // If last value null
    if (!isNumeric(y[y.length - 1])) {
      let arr = [];
      for (let i = y.length - 1; i > -1; i--) {
        if (arr.length > 0) {
          break;
        } else if (isNumeric(y[i])) {
          arr.push(i);
        }
      }
      y[y.length - 1] = y[arr[0]];
    }

    // Get inner values
    let data = [];
    let interp = [];
    for (let i = 0; i < y.length; i++) {
      if (isNumeric(y[i])) {
        data.push(i);
      } else {
        interp.push(i);
      }
    }

    for (let i = 0; i < interp.length; i++) {
      let index = indexOfLower(interp[i], data);
      y[interp[i]] =
        y[data[index]] +
        ((x[interp[i]] - x[data[index]]) *
          (y[data[index + 1]] - y[data[index]])) /
          (x[data[index + 1]] - x[data[index]]);
    }
    return y;
  }
};

const nearestInterpolate = (x, y) => {
  if (y.every(isNumeric)) {
    return y;
  } else {
    // If first value null
    if (!isNumeric(y[0])) {
      let arr = [];
      for (let i = 1; i < y.length; i++) {
        if (arr.length > 0) {
          break;
        } else if (isNumeric(y[i])) {
          arr.push(i);
        }
      }
      y[0] = y[arr[0]];
    }

    // If last value null
    if (!isNumeric(y[y.length - 1])) {
      let arr = [];
      for (let i = y.length - 1; i > -1; i--) {
        if (arr.length > 0) {
          break;
        } else if (isNumeric(y[i])) {
          arr.push(i);
        }
      }
      y[y.length - 1] = y[arr[0]];
    }

    // Get inner values
    let data = [];
    let xdata = [];
    let interp = [];
    for (let i = 0; i < y.length; i++) {
      if (isNumeric(y[i])) {
        data.push(i);
        xdata.push(x[i]);
      } else {
        interp.push(i);
      }
    }

    for (let i = 0; i < interp.length; i++) {
      let index = indexOfClosest(x[interp[i]], xdata);
      y[interp[i]] = y[data[index]];
    }
    return y;
  }
};

const isNumeric = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const indexOfLower = (num, arr) => {
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > num) {
      return i - 1;
    }
  }
  return 0;
};

const indexOfClosest = (num, arr) => {
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
