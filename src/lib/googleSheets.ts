export async function salvarTriagem(dados: any) {
  try {
    const resposta = await fetch("https://script.google.com/macros/s/AKfycbyH6rsXEACYSbALhy0GQqYmRtSf4y5XdWUSuLBpJ7ZY_KeWj3zNaHBXtVRUOT6g1GkG/exec", {
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