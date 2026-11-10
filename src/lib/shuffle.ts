function sameOrder<T>(left: readonly T[], right: readonly T[]) {
  return left.every((item, index) => item === right[index])
}

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  if (new Set(items).size < 2) return result
  do {
    for (let index = result.length - 1; index > 0; index--) {
      const swap = Math.floor(random() * (index + 1))
      ;[result[index], result[swap]] = [result[swap], result[index]]
    }
  } while (sameOrder(result, items))
  return result
}
