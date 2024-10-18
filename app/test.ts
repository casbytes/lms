function fib(n: number): number {
  if(n===0) return 0;
  if(n===1) return 1;
  let prevVal1 = 1, prevVal2 = 0, result = 0;
  for (let i = 2; i<=n; i++) {
    result = prevVal1 + prevVal2;
    prevVal2 = prevVal1
    prevVal1 = result
  }
  return result;
}

console.log(fib(10))


function fibArray(n: number): number[] {
  const result = [0, 1];
  for (let i = 2; i<=n; i++) {
    result.push(result[i-1] + result[i-2])
  }
  return result;
}

console.log(fibArray(10))