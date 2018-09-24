const rl = require('readline');

let i = rl.createInterface(process.stdin, process.stdout);

i.question("Enter your mathematical infix expression. Supported characters include +-*/()\n", (input) => {
  // 10.2*(8-6)/3+112.5
  const stack = [];
  const postfix = [];

  let temp = '';

  for (let i = 0; i < input.length; i++) {

    if (!isNaN(input.charAt(i))) {
      // If the character is a number, then keep checking numbers until an operator is reached.
      temp += input.charAt(i);

      while ((i+1) !== input.length && (!isNaN(input.charAt(i + 1)) || input.charAt(i+1) === '.')) {
        i++;
        temp += input.charAt(i);
      }

      // Outside of loop we have either end of string or operator. Either way, put temp into postfix and clear temp
      postfix.push(temp);
      temp = '';
    } else {
      // character is an operator
      if (stack.length === 0 || input.charAt(i) === '(') {
        stack.push(input.charAt(i));
      } else {
        if (input.charAt(i) === ')') {
          while (stack[stack.length - 1] !== '(') {
            postfix.push(stack.pop());
          }
          stack.pop();
        } else {
          if (stack[stack.length - 1] === '(') {
            stack.push(input.charAt(i));
          } else {
            while (stack.length !==  0 && stack[stack.length - 1] !== '(' && getPrecendence(input.charAt(i)) <= getPrecendence(stack[stack.length - 1])) {
              postfix.push(stack.pop());
            }
            stack.push(input.charAt(i));
          }
        }
      }
    }
  }


  while (stack.length !== 0) {
    postfix.push(stack.pop());
  }

  printPostfix(postfix);

  i.close();
  process.stdin.destroy();
});

printPostfix = (postfix) => {
  let str = ''
  postfix.forEach((s) => {
    str += s  + ' ';
  })
  console.log('postfix is:' + str);
}

getPrecendence = (char) => {
  if (char === '+' || char === '-') {
    return 1;
  } else if (char === '*' || char === '/') {
    return 2;
  } else {
    return 0;
  };
};
