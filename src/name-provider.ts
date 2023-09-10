export default class NameProvider {
  private names = new Set<string>();

  nextUnique(name: string) {
    let nextTry = name;
    let i = 1;

    while (this.names.has(nextTry)) {
      nextTry = `${name}_${i}`;
      i++;
    }

    this.names.add(nextTry);
    return nextTry;
  }
}
