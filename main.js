const rl = require('readline');

const VALID_CHARACTERS = '0123456789.+-*/()%';

let i = rl.createInterface(process.stdin, process.stdout);

askQuestion = () => {
  // 10.2*(8-6)/3+112.5
  i.question("Enter your mathematical infix expression or \"quit\" to exit. Supported characters include +-*/()% or the word POW\n", (rawInput) => {
    // Remove all spaces in the rawInput
    const input = rawInput.replace(/\s/g,'')
    if (input === 'quit') {
      console.log('exiting...')
      i.close();
      process.stdin.destroy();
    } else if (!validateInput(input)) {
      console.log('Input invalid.');
      askQuestion();
    } else {
      const infix = rawInput.replace(/POW/g,'^')
      const postfix = convertToPostFix(infix);

      printPostfix(postfix);

      calculatePostfix(postfix);

      askQuestion();
    }
  });
}

/**
 * Validate infix to make sure every character is included in the valid characters.
 * @param  {[string]} infix
 * @return {[boolean]}
 */
validateInput = (infix) => {
  for (let i = 0; i < infix.length; i++) {
    if (infix.charAt(i) === 'P') {
      // If the character is P, make sure the next 2 characters are O and W
      if (i + 3 > infix.length - 1) {
        // If the length of the string is less then the index of the character + 3,
        // then there is no way POW can be spelled out with a number after it, so return false
        return false;
      } else if (infix.charAt(i+1) !== 'O' || infix.charAt(i+2) !== 'W') {
        // If the character after the index is not O or 2 characters after the index is not W, return false
        return false;
      } else {
        i = i + 2;
      }
    } else {
      if (VALID_CHARACTERS.indexOf(infix.charAt(i)) === -1) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Convert infix expression to postfix
 * @param  {[string]} input
 * @return {[array]}
 */
convertToPostFix = (input) => {
  const stack = [];
  const postfix = [];

  let temp = '';

  for (let i = 0; i < input.length; i++) {

    if (!isNaN(input.charAt(i))) {
      // If the character is a number, then keep checking numbers and append temp until an operator is reached.
      temp += input.charAt(i);

      while ((i+1) !== input.length && (!isNaN(input.charAt(i + 1)) || input.charAt(i+1) === '.')) {
        i++;
        temp += input.charAt(i);
      }

      // Outside of loop we have either end of string or operator. Either way, put temp into postfix and clear temp.
      postfix.push(temp);
      temp = '';
    } else {
      // If the character is an operator...
      if (stack.length === 0 || input.charAt(i) === '(') {
        // If the stack is empty or the char is an open parens, push to stack.
        stack.push(input.charAt(i));
      } else {
        // If the stack is not empty and the char is not an open parens...
        if (input.charAt(i) === ')') {
          // If the char is a closing parens...
          while (stack[stack.length - 1] !== '(') {
            // Keep popping off the top of the stack and append postfix with that value until an open parens is reached.
            postfix.push(stack.pop());
          }
          // Remove the open parens.
          stack.pop();
        } else {
          // If the stack is not empty and the char is not an open parens AND the char is not a closing parens (i.e. arithmetic operation)...
          if (stack[stack.length - 1] === '(') {
            // If the top of the stack is an open paren, push the operator
            stack.push(input.charAt(i));
          } else {
            // Otherwise, continue to pop off stack and push to postfix as long as
            // 1. Stack is not empty
            // 2. Top of stack is not open parens
            // 3. The precendence of this character is less than or equal to the order of the top of stack
            while (stack.length !==  0 && stack[stack.length - 1] !== '(' && getOrder(input.charAt(i)) <= getOrder(stack[stack.length - 1])) {
              postfix.push(stack.pop());
            }

            // Push the operator to the top of stack.
            stack.push(input.charAt(i));
          }
        }
      }
    }
  }

  // Push everything remaining on the stack to postfix.
  while (stack.length !== 0) {
    postfix.push(stack.pop());
  }

  return postfix;
}

/**
 * Get the precendence value of a character
 * @param  {[string]} char
 * @return {[number]}
 */
getOrder = (char) => {
  if (char === '+' || char === '-') {
    return 1;
  } else if (char === '*' || char === '/') {
    return 2;
  } else if (char === '^') {
    return 3;
  } else {
    return 0;
  };
};

/**
 * Print the postfix to the console.
 * @param  {[array]} postfix
 * @return {[string]}
 */
printPostfix = (postfix) => {
  let str = ''
  postfix.forEach((s) => {
    if (s === '^') {
      str += 'POW '
    } else {
      str += s  + ' ';
    }
  })
  console.log('postfix is:' + str);
};

/**
 * Given a valid postfix expression (as array), calculatre the result.
 * @param  {[array]} postfix
 */
calculatePostfix = (postfix) => {
  const stack = [];
  for (let i = 0; i < postfix.length; i++) {
    // If the item is not a number (i.e. operation)
    const item = postfix[i];
    if (isNaN(item)) {
      // Pop off the first top two numbers on the stack and execute the operation. Push the result back onto the stack.
      const second = parseFloat(stack.pop());
      const first = parseFloat(stack.pop());
      if (item === '+') {
        stack.push(first + second);
      } else if (item === '-') {
        stack.push(first - second);
      } else if (item === '*') {
        stack.push(first * second);
      } else if (item === '/') {
        if (second === 0) {
          // Can't divide by 0
          break;
        }
        stack.push(first / second);
      } else if (item === '%') {
        stack.push(first % second);
      } else if (item === '^') {
        stack.push(Math.pow(first, second));
      } else {
        console.log('something went wrong...');
        stack.push(first);
        stack.push(second);
      }
    } else {
      // Item is a number, so just push onto the stack
      stack.push(item);
    }
  }

  // At this point, the stack should only have 1 item so display that item.
  console.log(stack[0] || NaN);
}

askQuestion();
