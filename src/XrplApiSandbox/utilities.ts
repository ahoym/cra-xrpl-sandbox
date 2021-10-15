export function logAndPass(result: any) {
  console.log(result);
  return result;
}

export function logMessageAndPass(message: string) {
  return function (result: any) {
    console.log(message);
    console.log(result);
    return result;
  };
}
