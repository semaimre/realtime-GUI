const textarea = document.getElementById('editor');
const code = editor.textContent;


const patterns = [
  { type: 'keyword', regex: /\b(if|else|for|while|function|return|let|const|var|class|variable)\b/g },
  { type: 'operator', regex: /[+\-*/=<>!]+/g },
  { type: 'literal', regex: /(["'`].*?["'`])|\b\d+(\.\d+)?\b/g },
  { type: 'parantez', regex: /[()[\]{}]/g },
  { type: 'tanımlayıcı', regex: /\b[a-zA-Z_]\w*\b/g },
];

function escapeHTML(text) {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}

function tokenize(code) {
  let tokens = [];
  
  patterns.forEach(({ type, regex }) => {
    let match;
    while ((match = regex.exec(code)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        type
      });
    }
  });

  // Çakışan tokenları kaldır (en soldakini seç)
  tokens.sort((a, b) => a.start - b.start || b.end - a.end);
  const nonOverlapping = [];
  let lastEnd = 0;
  for (const token of tokens) {
    if (token.start >= lastEnd) {
      nonOverlapping.push(token);
      lastEnd = token.end;
    }
  }

  return nonOverlapping;
}

class ParseError extends Error {
  constructor(message, token) {
    super(message);
    this.name = "ParseError";
    this.token = token; // Hata yapılan token
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.declaredVars = new Set(); // tanımlanan değişken isimleri
  }
 parseReturnStatement() {
  this.consume('keyword', 'return');
  this.parseExpression(); // return ifadesinden sonra bir ifade gelmeli
  if (this.peek() && this.peek().text === ';') {
    this.consume('operator', ';');
  }
 }

  peek(offset = 0) {
    return this.tokens[this.pos + offset];
  }

  consume(type, value) {
    const token = this.peek();
    if (!token) throw new ParseError(`Bekleniyordu: ${type} ${value || ''}, fakat dosya sonu geldi.`, null);
    if (token.type !== type) throw new ParseError(`Bekleniyordu: tip ${type}, fakat ${token.type} bulundu.`, token);
    if (value && token.text !== value) throw new ParseError(`Bekleniyordu: '${value}', fakat '${token.text}' bulundu.`, token);
    this.pos++;
    return token;
  }

  parseProgram() {
    while (this.pos < this.tokens.length) {
      this.parseStatement();
    }
  }

  parseStatement() {
    const token = this.peek();
    if (!token) return;
    if (token.type === 'keyword') {
      if (token.text === 'let') {
        this.parseDeclaration();
      } else if (token.text === 'if') {
        this.parseIfStatement();
      } else {
        throw new ParseError(`Bilinmeyen anahtar kelime: ${token.text}`, token);
      }
    } else {
      throw new ParseError(`Beklenmeyen token: ${token.text}`, token);
    }
  }

  parseDeclaration() {
    this.consume('keyword', 'let');
    const nextToken = this.peek();
    if (nextToken.type === 'keyword' && nextToken.text === 'variable') {
      this.parseVariableDeclaration();
    } else if (nextToken.type === 'keyword' && nextToken.text === 'function') {
      this.parseFunctionDeclaration();
    } else {
      throw new ParseError(`'let' sonrası bekleniyordu: 'variable' veya 'function', fakat '${nextToken.text}' bulundu.`, nextToken);
    }
  }

  parseVariableDeclaration() {
  this.consume('keyword', 'variable');
  const idToken = this.consume('tanımlayıcı');
  this.declaredVars.add(idToken.text); // değişken tanımlandı

  if (this.peek() && this.peek().type === 'operator' && this.peek().text === '=') {
    this.consume('operator', '=');
    this.parseExpression();
  }

  // ";" opsiyonel olarak eklenebilir
  if (this.peek() && this.peek().text === ';') {
    this.consume('operator', ';');
  }
}

  parseFunctionDeclaration() {
    this.consume('keyword', 'function');
    this.consume('tanımlayıcı');
    this.consume('parantez', '(');
    this.consume('parantez', ')');

    if (this.peek() && this.peek().type === 'parantez' && this.peek().text === '{') {
      this.consume('parantez', '{');
      while (this.peek() && !(this.peek().type === 'parantez' && this.peek().text === '}')) {
        this.parseStatement();
      }
      this.consume('parantez', '}');
    }
  }

  parseIfStatement() {
    this.consume('keyword', 'if');
    this.consume('parantez', '(');
    this.parseExpression();
    this.consume('parantez', ')');

    this.consume('parantez', '{');
    while (this.peek() && !(this.peek().type === 'parantez' && this.peek().text === '}')) {
      this.parseStatement();
    }
    this.consume('parantez', '}');

    if (this.peek() && this.peek().type === 'keyword' && this.peek().text === 'else') {
      this.consume('keyword', 'else');
      this.consume('parantez', '{');
      while (this.peek() && !(this.peek().type === 'parantez' && this.peek().text === '}')) {
        this.parseStatement();
      }
      this.consume('parantez', '}');
    }
  }

  parseExpression() {
  this.parseTerm();

  while (this.peek() && this.peek().type === 'operator' && ['+', '-'].includes(this.peek().text)) {
    this.consume('operator');
    this.parseTerm();
  }
}

parseTerm() {
  this.parseFactor();

  while (this.peek() && this.peek().type === 'operator' && ['*', '/'].includes(this.peek().text)) {
    this.consume('operator');
    this.parseFactor();
  }
}

parseFactor() {
  const token = this.peek();
  if (!token) throw new Error('Beklenen ifade (factor) bulunamadı.');

  if (token.type === 'literal' || token.type === 'tanımlayıcı') {
    this.pos++;
  } else if (token.type === 'parantez' && token.text === '(') {
    this.consume('parantez', '(');
    this.parseExpression();
    this.consume('parantez', ')');
  } else {
    throw new Error(`Geçersiz ifade: ${token.text}`);
  }
}
parseStatement() {
  const token = this.peek();
  if (!token) return;

  if (token.type === 'keyword') {
    if (token.text === 'let') {
      this.parseDeclaration();
    } else if (token.text === 'if') {
      this.parseIfStatement();
    } else if (token.text === 'return') {
      this.parseReturnStatement();
    } else {
      throw new ParseError(`Bilinmeyen anahtar kelime: ${token.text}`, token);
    }
  } else if (token.type === 'tanımlayıcı') {
    this.parseAssignment();
  } else {
    throw new ParseError(`Beklenmeyen token: ${token.text}`, token);
  }
}
parseAssignment() {
  const idToken = this.consume('tanımlayıcı');
  if (!this.declaredVars.has(idToken.text)) {
    throw new ParseError(`Değişken '${idToken.text}' tanımlanmamış.`, idToken);
  }

  this.consume('operator', '=');
  this.parseExpression();

  if (this.peek() && this.peek().text === ';') {
    this.consume('operator', ';');
  }
}

  parseLiteral() {
    const token = this.peek();
    if (token && token.type === 'literal') {
      this.pos++;
    } else {
      throw new ParseError('Beklenen literal değer.', token);
    }
  }
}

function calistir() {
  const textarea = document.getElementById('girdi');
  const output = document.getElementById('derleyici');
  const code = textarea.value;
  output.innerHTML = highlight(code);

  const tokens = tokenize(code);
  try {
    const parser = new Parser(tokens);
    parser.parseProgram();
    document.getElementById('hata').innerText = "Sözdizimi hatası yok.";
  } catch (e) {
    if (e instanceof ParseError && e.token) {
      highlightWithError(code, tokens, e.token.start, e.token.end);
      document.getElementById('hata').innerText = e.message;
    } else {
      console.error(e);
      document.getElementById('hata').innerText = "Bilinmeyen hata: " + e.message;
    }
  }
}


function highlightWithError(code, tokens, errStart, errEnd) {
  let result = '';
  let lastIndex = 0;

  tokens.forEach(token => {
    if (token.start >= lastIndex) {
      if (token.start === errStart && token.end === errEnd) {
        result += escapeHTML(code.slice(lastIndex, token.start));
        result += `<span class="error">${escapeHTML(token.text)}</span>`;
        lastIndex = token.end;
      } else {
        result += escapeHTML(code.slice(lastIndex, token.start));
        result += `<span class="${token.type}">${escapeHTML(token.text)}</span>`;
        lastIndex = token.end;
      }
    }
  });

  result += escapeHTML(code.slice(lastIndex));

  const caretPos = saveCaretPosition(editor);

  editor.innerHTML = result;

  restoreCaretPosition(editor, caretPos);
}



function highlight(code) {
  const tokens = tokenize(code);
  let result = '';
  let lastIndex = 0;

  for (const token of tokens) {
    // Önce aradaki boşlukları, kaçırılmış karakterleri ekle
    if (token.start > lastIndex) {
      result += escapeHTML(code.slice(lastIndex, token.start));
    }

    // Token'ı renklendir
    result += `<span class="${token.type}">${escapeHTML(token.text)}</span>`;
    lastIndex = token.end;
  }

  // Son kalan kısmı ekle (tokenlenmemiş son karakterler)
  result += escapeHTML(code.slice(lastIndex));
 
  return result;
}


textarea.addEventListener('input', () => {
  const code = textarea.value;
  output.innerHTML = highlight(code);

  const tokens = tokenize(code);
  try {
    const parser = new Parser(tokens);
    parser.parseProgram();
    console.log('Syntax hatası yok');
  } catch (e) {
    if (e instanceof ParseError && e.token) {
      const errorToken = e.token;
      highlightWithError(code, tokens, errorToken.start, errorToken.end);
    } else {
      console.error(e);
    }
  }
});

// caret (imleç) konumunu kaydetmek ve geri yüklemek için yardımcı fonksiyonlar
function saveCaretPosition(context) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(context);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  return start;
}

function restoreCaretPosition(context, pos) {
  function getTextNodeAtPosition(node, index) {
    let stack = [node], 
        charIndex = 0, 
        foundNode = null, 
        foundOffset = 0;
    while (stack.length > 0) {
      let currNode = stack.pop();
      if (currNode.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + currNode.length;
        if (index <= nextCharIndex) {
          foundNode = currNode;
          foundOffset = index - charIndex;
          break;
        }
        charIndex = nextCharIndex;
      } else {
        for (let i = currNode.childNodes.length - 1; i >= 0; i--) {
          stack.push(currNode.childNodes[i]);
        }
      }
    }
    return { node: foundNode, offset: foundOffset };
  }

  const selection = window.getSelection();
  const range = document.createRange();
  const { node, offset } = getTextNodeAtPosition(context, pos);
  if (node) {
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Gerçek zamanlı renklendirme fonksiyonunu şu şekilde değiştiriyoruz:
function updateEditor() {
  const code = editor.innerText;
  const caretPos = saveCaretPosition(editor);
  editor.innerHTML = highlight(code);
  restoreCaretPosition(editor, caretPos);
}

// Event listener ekle:
editor.addEventListener('input', () => {
  updateEditor();

  const code = editor.innerText;
  const tokens = tokenize(code);
  try {
    const parser = new Parser(tokens);
    parser.parseProgram();
    document.getElementById('hata').innerText = "Sözdizimi hatası yok.";
  } catch (e) {
    if (e instanceof ParseError && e.token) {
      const errorToken = e.token;
      highlightWithError(code, tokens, errorToken.start, errorToken.end);
      document.getElementById('hata').innerText = e.message;
    } else {
      console.error(e);
      document.getElementById('hata').innerText = "Bilinmeyen hata: " + e.message;
    }
  }
});

// Tab tuşuna basınca 2 boşluk ekleme (isteğe bağlı)
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertText', false, '  ');
  }
});

function saveCaretPosition(context) {
  const selection = window.getSelection();
  let charCount = -1, node;

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(context);
    preRange.setEnd(range.endContainer, range.endOffset);
    charCount = preRange.toString().length;
  }
  return charCount;
}

function restoreCaretPosition(context, chars) {
  if (chars < 0) return;

  const selection = window.getSelection();
  let nodeStack = [context], node, foundStart = false, stop = false;
  let charIndex = 0, range = document.createRange();

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === 3) { // metin düğümü
      const nextCharIndex = charIndex + node.length;
      if (!foundStart && chars >= charIndex && chars <= nextCharIndex) {
        range.setStart(node, chars - charIndex);
        range.collapse(true);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;
      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  if (range) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
editor.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();

    const br = document.createElement("br");
    const range = window.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(br);

    // İmleci <br>'nin sonrasına taşı
    range.setStartAfter(br);
    range.setEndAfter(br);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    document.execCommand('insertText', false, '  ');
  }
});


