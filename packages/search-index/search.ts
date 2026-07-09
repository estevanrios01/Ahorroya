import { searchIndex } from "./memory";
import { tokenize } from "./tokenizer";
import { ranking } from "./ranking";

export function search(query: string) {
  return ranking(tokenize(query), searchIndex.all());
}
