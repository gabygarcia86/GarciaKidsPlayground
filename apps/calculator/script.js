// Calculator app

const outputEl = document.querySelector(".text");
const valEl = document.querySelectorAll(".val");
const ClearEl = document.querySelector(".AC");
const deleteEl = document.querySelector(".DEL");
const equalEl = document.querySelector(".equal");

const applyPercent = () => {
  const expression = outputEl.value.replace(/\s+/g, "");
  let operandStart;

  if (expression.endsWith(")")) {
    let depth = 0;
    for (let i = expression.length - 1; i >= 0; i -= 1) {
      if (expression[i] === ")") depth += 1;
      if (expression[i] === "(") depth -= 1;
      if (depth === 0) {
        operandStart = i;
        break;
      }
    }
  } else {
    const numberMatch = expression.match(
      /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/,
    );
    if (numberMatch) {
      operandStart = numberMatch.index;
      if (
        expression[operandStart - 1] === "-" &&
        (operandStart === 1 || /[+\-*/(]/.test(expression[operandStart - 2]))
      ) {
        operandStart -= 1;
      }
    }
  }

  if (operandStart === undefined) return;

  const prefix = expression.slice(0, operandStart);
  const operator = prefix.slice(-1);
  const operandExpression = expression.slice(operandStart);

  try {
    const operand = eval(operandExpression);
    let percentValue = operand / 100;

    if (operator === "+" || operator === "-") {
      const base = eval(prefix.slice(0, -1));
      percentValue = base * percentValue;
    } else if (operator !== "*" && operator !== "/") {
      percentValue = operand / 100;
    }

    outputEl.value = `${prefix}${percentValue}`;
  } catch (e) {
    alert(e);
  }
};

// It adds every value and display at the output
valEl.forEach((val) => {
  val.addEventListener("click", () => {
    if (val.value === "%") {
      applyPercent();
      return;
    }
    outputEl.value += val.dataset.value || val.value;
  });
});

// It clears all the digits in the output
ClearEl.addEventListener("click", () => {
  outputEl.value = "";
});

// It deletes the last digit in the output
deleteEl.addEventListener("click", () => {
  outputEl.value = outputEl.value.slice(0, -1);
});

// If there is no error, it evaluates the output value or else it shows syntax error as a alert message.
equalEl.addEventListener("click", () => {
  try {
    outputEl.value = eval(outputEl.value);
  } catch (e) {
    alert(e);
  }
});
