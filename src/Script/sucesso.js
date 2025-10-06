import { clerk, initializeAuth } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const statusDiv = document.getElementById('status-pagamento');
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
        statusDiv.innerHTML = "<h2>Erro</h2><p>ID da sessão de pagamento não encontrado.</p>";
        return;
    }

    statusDiv.innerHTML = "<h2>Verificando seu pagamento...</h2><p>Por favor, aguarde.</p>";

    try {
        await initializeAuth();

        if (!clerk.session) {
            throw new Error("Sessão de usuário não encontrada. Por favor, faça o login e contate o suporte se a cobrança foi efetuada.");
        }
        
        const token = await clerk.session.getToken();

        const response = await fetch('http://localhost:3000/verificar-pagamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId: sessionId })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Falha na verificação do pagamento.');
        }

        statusDiv.innerHTML = `
            <h2>Pagamento Aprovado!</h2>
            <p>Obrigado pela sua compra. Seus jogos já estão disponíveis na sua biblioteca.</p>
            <p>Você será redirecionado em 5 segundos...</p>
        `;

        setTimeout(() => {
            window.location.href = 'biblioteca.html';
        }, 5000);

    } catch (error) {
        console.error("Erro no processo de sucesso:", error);
        statusDiv.innerHTML = `
            <h2>Ocorreu um Erro na Verificação</h2>
            <p>Não se preocupe, seu pagamento pode ter sido recebido, mas houve um problema ao adicionar os jogos à sua conta.</p>
            <p><strong>Mensagem de Erro:</strong> ${error.message}</p>
            <p>Por favor, entre em contato com o suporte.</p>
        `;
    }
});