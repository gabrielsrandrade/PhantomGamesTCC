// document.addEventListener("DOMContentLoaded", async () => {
//   window.addEventListener("clerkLoaded", async () => {
//     await window.Clerk.load({
//       publishableKey: "pk_test_ZXZpZGVudC1tYW4tMjguY2xlcmsuYWNjb3VudHMuZGV2JA"
//     });

//     const form = document.getElementById("formLogin");

//     form.addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const email = document.getElementById("email").value;
//       const senha = document.getElementById("senha").value;

//       try {

//         fetch("http://localhost:3333/login", {method: "GET", body: {email, password: senha}})

//         // const signIn = await window.Clerk.signIn.create({
//         //   identifier: email,
//         //   password: senha,
//         // });

//         // if (signIn.status === "complete") {
//         //   await window.Clerk.setActive({
//         //     session: signIn.createdSessionId,
//         //   });

//         //   window.location.href = "homepage.html";
//         // } else {
//         //   alert("Erro ao fazer login.");
//         // }

//       } catch (error) {
//         console.error("Erro no login:", error);
//         alert("Erro: " + (error.errors?.[0]?.message || error.message));
//       }
//     });
//   });
// });

const form = document.getElementById("formLogin");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

    try {
      const response = await fetch("http://localhost:3333/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailAddress: email, password: senha }),
      });

    // const signIn = await window.Clerk.signIn.create({
    //   identifier: email,
    //   password: senha,
    // });

    // if (signIn.status === "complete") {
    //   await window.Clerk.setActive({
    //     session: signIn.createdSessionId,
    //   });

    //   window.location.href = "homepage.html";
    // } else {
    //   alert("Erro ao fazer login.");
    // }

  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro: " + (error.errors?.[0]?.message || error.message));
  }
});