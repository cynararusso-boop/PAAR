export async function salvarTriagem(dados: any) {
  try {
    const resposta = await fetch("https://script.google.com/macros/s/AKfycbwByIQm3OpWQvd8RHeA7Su9J7cwHCo1OrpttAje2yePYUly8sspBPS9MeuDMjrqvVre/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    })

    return await resposta.json()
  } catch (erro) {
    console.error("Erro ao salvar:", erro)
  }
}