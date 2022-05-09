import { select } from "d3";

export const verifyString = (string) => {
  return typeof string === "string";
};

export const verifyNumber = (number) => {
  return typeof number === "number" && !isNaN(number);
};

export const verifyBool = (bool) => {
  return typeof bool === "boolean";
};

export const verifyFunction = (f) => {
  return typeof f === "function";
};

export const verifyDiv = (div) => {
  if (select("#" + div)._groups[0][0] === null) {
    throw new Error(
      "Div with ID: " + div + " not found, graph could not be added."
    );
  }
};
