const form = document.getElementById("formCadastro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const response = await fetch("http://localhost:3000/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      form.reset();
      window.location.href = "homepage-logado.html";
    } else {
      console.error("Erro ao cadastrar:", data);
    }
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
  }
});
