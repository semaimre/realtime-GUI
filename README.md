# 🖥️ Gerçek Zamanlı Mini GUI
Bu proje, kullanıcıların **kod yazarken anlık olarak sözdizimi renklendirmesi** ve **hata uyarıları** görebileceği, tamamen tarayıcıda çalışan bir kod editörüdür. Basit bir gramer yapısına sahip diller için eğitim amaçlı geliştirilmiştir.

🧠 Kodunuzu yazarken anında analiz edilir, renklendirilir ve hatalı yerler size gösterilir.

---

## ✨ Neler Yapabilirsiniz?

- ✅ Kod yazın  
- ✅ Sözdizimi hatalarını anında görün  
- ✅ Anahtar kelimeler, değişkenler, stringler ve daha fazlası otomatik olarak renklendirilsin  
- ✅ Hatalı token'lar kırmızıyla vurgulansın  
- ✅ Kod yazarken imleç konumunuz korunur  

---

## 🛠️ Nasıl Çalışıyor?

- Bu editör, arka planda hem **sözcük analizi** (lexical analysis) hem de **sözdizimi analizi** (syntax analysis) yapar.

### ✍️ Token Tanıma (Lexical Analyzer)
Kodunuz parçalanarak türleri belirlenir:
- Keywords: if, else, function, return, let, variable
- Operatörler: +, -, *, /, =, <, >
- Literal: Sayısal ve metin sabitleri.
- Parantezler: {} , () , []
- Tanımlayıcılar: Bir harf veya alt çizgi ile başlayan, boşluk içermeyen fonksiyon veya değişken isimleri.

## 💡 Token Türleri ve Vurgulama Renkleri

| Token Türü     | Örnekler                                 | Renk Kodu  |
|----------------|-------------------------------------------|------------|
| **keyword**     | `if`, `else`, `for`, `function`, `return` | `#a2004f`  |
| **operator**    | `+`, `-`, `=`, `==`, `!=`, `<`, `>`        | `#841a9e`  | 
| **literal**     | `"hello"`, `'a'`, `` `template` ``, `123`, `3.14` | `#a4be61`  | 
| **parantez**    | `(`, `)`, `{`, `}`, `[`, `]`              | `#4294c1`  | 
| **tanımlayıcı** | `myVar`, `calculate`, `user_name`         | `#b6d4d6`  | 



### 🧩 Sözdizimi Kontrolü (Syntax Analyzer)
Kodun kurallara uygun yazılıp yazılmadığı kontrol edilir. Desteklenen yapılar:

- Değişken ve fonksiyon tanımı  
- `if / else` blokları  
- Atama işlemleri  
- `return` ifadeleri
  
| Yapı Türü              | Söz Dizimi Örneği                      | Açıklama                                                           |
|------------------------|----------------------------------------|--------------------------------------------------------------------|
| Değişken Tanımı        | `let variable x = 5;`                  | Değişken tanımlar. Atama opsiyoneldir.                            |
| Fonksiyon Tanımı       | `let function foo() { ... }`           | Fonksiyon tanımlar. Parametre yok. Blok gerektirir.               |
| Atama                  | `x = 10;`                              | Daha önce tanımlanmış bir değişkene değer atar.                   |
| Koşul (if-else)        | `if (x > 5) { ... } else { ... }`      | Koşullu ifade. Else opsiyoneldir.                                 |
| Return İfadesi         | `return x + 5;`                        | Fonksiyondan değer döndürür.                                      |
| İfade (Expression)     | `3 + 4 * (x - 1)`                      | Sayılar, değişkenler, parantezli alt ifadeler ve operatörler içerir.|
| Term                   | `factor * factor` veya `factor / factor` | Çarpma ve bölme işlemleri.                                        |
| Factor                 | `x`, `10`, `"metin"`, `(x + 1)`        | Bir değişken, sayı, literal ya da parantezli ifade olabilir.      |
| Blok                   | `{ statement1; statement2; }`          | Birden fazla ifadeyi gruplamak için kullanılır.                   |


### 🎨 Renklendirme
- Kodunuz yazıldıkça token’lar HTML `<span>` etiketleriyle renklendirilir. Hatalı kısımlar kırmızı arka planla vurgulanır.  

---

## 🖼️ Arayüz Bileşenleri

- **Kod Editörü:** Yazdığınız alan (`contenteditable`)  
- **Renklendirme Katmanı:** Canlı HTML çıktısı  
- **Hata Paneli:** Hangi token’ın neden hatalı olduğunu açıklayan bölüm  

---

## ⚙️ Kullanılan Teknolojiler

| Teknoloji | Açıklama |
|-----------|----------|
| **JavaScript** | Tüm analiz ve renklendirme işlemleri için |
| **HTML + CSS** | Arayüz ve stil |
| **Regular Expressions** | Token tanıma için |
| **Recursive Descent Parser** | Sözdizimi çözümleme için |

---

## 💡 Geliştirme Sürecinde Karşılaşılan Zorluklar

- **İmleç Konumu Kayması:** DOM güncellemesi sırasında imleç sıfırlanıyordu → `Range API` ile korundu  
- **Çakışan Tokenlar:** Bazı ifadeler birden fazla token türüne giriyordu → Konum tabanlı filtreleme eklendi  
- **Hatalı Kodlarda Çökme:** Özel `ParseError` sınıfı ile kontrol altına alındı  
- **Tab / Enter Desteği:** Klavye olaylarıyla manuel olarak yönetildi  
- **Performans Sorunları:** Sadece değişen kısmın yeniden analiz edilmesi sağlandı  

---

## 🎥 Demo & Bağlantılar
- **Kod yazmaya başlamak için**:[Tıklayınız](https://semaimre.github.io/realtime-GUI/)
- 📹 **Video Tanıtım:** [YouTube'da İzle](https://youtu.be/kBZkmNas5B4?si=F7fYh9ewPWsepgAe)  
- 📁 **Kaynak Kod:** [HTML](https://github.com/semaimre/realtime-GUI/blob/main/index.html)
- [CSS](https://github.com/semaimre/realtime-GUI/blob/main/style.css)
- [JavaScript](https://github.com/semaimre/realtime-GUI/blob/main/script.js)
- 📚 **Makale:** [Tıklayınız](https://github.com/semaimre/realtime-GUI/blob/main/miniGUI.pdf)

  ---
  
## 🧠 Hangi Kurallara Göre Analiz Yapılıyor?

Editörün tanıdığı dil kuralları basitleştirilmiş bir gramerle yazılmıştır. Projenin BNF tanımı:

```bnf
<program>          ::= <statement>*
<statement>        ::= <declaration> | <if-statement> | <assignment> | <return-statement>
<declaration>      ::= "let" ("variable" <id> ["=" <expr>] | "function" <id> "()" "{" <statement>* "}")
<if-statement>     ::= "if" "(" <expr> ")" "{" <statement>* "}" [ "else" "{" <statement>* "}" ]
<assignment>       ::= <id> "=" <expr>
<return-statement> ::= "return" <expr>
<expr>             ::= <term> { ("+" | "-") <term> }*
<term>             ::= <factor> { ("*" | "/") <factor> }*
<factor>           ::= <literal> | <id> | "(" <expr> ")"
<literal>          ::= sayı | string
<id>               ::= harf { harf | rakam }*
---
