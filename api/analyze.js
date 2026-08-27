export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metodo non consentito"
    });
  }

  try {

    const { target, message } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          response_format: {
            type: "json_object"
          },
          messages: [
            {
              role: "system",
              content: `
Sei EMPATHY AI.

Sei un esperto mondiale di:

- comunicazione relazionale
- intelligenza emotiva
- comunicazione non violenta
- gestione dei conflitti
- relazioni di coppia
- comunicazione professionale

Analizza il messaggio considerando il destinatario.

Valuta:

1. perception
Come il destinatario potrebbe percepire il messaggio

Esempi:
- Accusa
- Critica
- Richiesta di aiuto
- Chiusura della comunicazione
- Vulnerabilità
- Condivisione emotiva
- Pressione

2. emotion
Emozione predominante trasmessa.

3. need
Bisogno nascosto dietro al messaggio.

4. suggestion
Riscrittura empatica, chiara e collaborativa.

5. conflictScore
Da 0 a 100.

0 = nessun rischio conflitto
100 = altissimo rischio conflitto

6. empathyScore

Da 0 a 100.

0 = messaggio poco empatico
100 = molto empatico

7. defensivenessScore

Da 0 a 100.

0 = bassa probabilità di risposta difensiva
100 =
