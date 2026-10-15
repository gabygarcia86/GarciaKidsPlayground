// Calculator app

const outputEl = document.querySelector(".text");
const valEl = document.querySelectorAll(".val");
const ClearEl = document.querySelector(".AC");
const deleteEl = document.querySelector(".DEL");
const equalEl = document.querySelector(".equal");
const noticeEl = document.getElementById("notice");

let previousOutputValue = outputEl.value;
let shakeFrame;
let calculatorNoticeTimer;

const showCalculatorNotice = (message) => {
  noticeEl.textContent = message;
  noticeEl.hidden = false;
  clearTimeout(calculatorNoticeTimer);
  calculatorNoticeTimer = setTimeout(() => {
    noticeEl.hidden = true;
  }, 3000);
};

const checkForShake = () => {
  const currentValue = outputEl.value;
  if (currentValue === "404" && previousOutputValue !== "404") {
    showCalculatorNotice("404 Error : Fun Not Found");
  } else if (currentValue === "42" && previousOutputValue !== "42") {
    showCalculatorNotice(
      "Congratulations, You've unlocked the meaning of life",
    );
  }
  if (currentValue === "67" && previousOutputValue !== "67") {
    document.body.classList.remove("screen-rotate");
    cancelAnimationFrame(shakeFrame);
    shakeFrame = requestAnimationFrame(() => {
      document.body.classList.add("screen-rotate");
    });
  } else if (currentValue !== "67") {
    cancelAnimationFrame(shakeFrame);
  }
  previousOutputValue = currentValue;
};

const setOutputValue = (value) => {
  outputEl.value = value;
  checkForShake();
};

outputEl.addEventListener("input", checkForShake);
document.body.addEventListener("animationend", (event) => {
  if (event.animationName === "calculator-screen-rotate") {
    document.body.classList.remove("screen-rotate");
  }
});

const evaluateExpression = (expression) => {
  const explicitMultiplication = expression
    .replace(/(\d|\))\s*(?=\()/g, "$1*")
    .replace(/\)\s*(?=[\d.])/g, ")*");
  return eval(explicitMultiplication);
};

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
    const operand = evaluateExpression(operandExpression);
    let percentValue = operand / 100;

    if (operator === "+" || operator === "-") {
      const base = evaluateExpression(prefix.slice(0, -1));
      percentValue = base * percentValue;
    } else if (operator !== "*" && operator !== "/") {
      percentValue = operand / 100;
    }

    setOutputValue(`${prefix}${percentValue}`);
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
    setOutputValue(outputEl.value + (val.dataset.value || val.value));
  });
});

// It clears all the digits in the output
ClearEl.addEventListener("click", () => {
  setOutputValue("");
});

// It deletes the last digit in the output
deleteEl.addEventListener("click", () => {
  setOutputValue(outputEl.value.slice(0, -1));
});

// If there is no error, it evaluates the output value or else it shows syntax error as a alert message.
equalEl.addEventListener("click", () => {
  try {
    setOutputValue(evaluateExpression(outputEl.value));
  } catch (e) {
    alert(e);
  }
});
