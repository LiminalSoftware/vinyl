//export function* entries(obj) {
//  for (let key of Object.keys(obj)) {
//    yield [key, obj[key]];
//  }
//}

export function entries(obj) {
  return Object.keys(obj).map((key)=> {
    return [key, obj[key]];
  })
}