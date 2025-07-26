document.addEventListener("DOMContentLoaded", async () => {
  window.addEventListener("clerkLoaded", async () => {
    await window.Clerk.load({
      publishableKey: "pk_test_ZXZpZGVudC1tYW4tMjguY2xlcmsuYWNjb3VudHMuZGV2JA"
    });

    const form = document.getElementById("formLogin");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const senha = document.getElementById("senha").value;

      try {
        const signIn = await window.Clerk.signIn.create({
          identifier: email,
          password: senha,
        });

        if (signIn.status === "complete") {
          await window.Clerk.setActive({
            session: signIn.createdSessionId,
          });

          window.location.href = "homepage-logado.html";
        } else {
          alert("Erro ao fazer login.");
        }
      } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro: " + (error.errors?.[0]?.message || error.message));
      }
    });
  });
});
