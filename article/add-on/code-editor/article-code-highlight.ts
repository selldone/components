import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-php";
import "prismjs/components/prism-python";

/** Keep authored language keys unchanged; Prism uses its own grammar names. */
export function highlightArticleCode(code: string, language: string) {
  const grammarName =
    language === "html" ? "markup" : language === "C++" ? "cpp" : language;
  const grammar = Object.prototype.hasOwnProperty.call(
    Prism.languages,
    grammarName,
  )
    ? Prism.languages[grammarName]
    : null;
  // Unknown authored languages remain safe, readable source text.
  return grammar && typeof grammar === "object"
    ? Prism.highlight(code, grammar, grammarName)
    : Prism.util.encode(code);
}
