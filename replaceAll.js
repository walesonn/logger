export default function (data, regex, replace) {
  let expression = regex;
  if (!data) throw Error("Not data especify");

  if (!expression) expression = /[^\d\. ]/;

  let aux = "";
  for (let letter of data) {
    aux += letter.replace(expression, replace ?? " ");
  }

  return aux.trim();
}
