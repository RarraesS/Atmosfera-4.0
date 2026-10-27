
const API_URL = "http://localhost:8080";
const ID_DISPOSITIVO = 1;

// Atualiza os indicadores
async function carregarIndicadores() {
    try {
        const resposta = await fetch(`${API_URL}/registros/ultimo`);
        if (!resposta.ok) return;

        const dados = await resposta.json();

        document.getElementById("temperatura").textContent =
            dados.temperatura + " °C";

        document.getElementById("umidade").textContent =
            dados.umidade + " %";

        document.getElementById("pressao").textContent =
            dados.pressao + " hPa";

        document.getElementById("luminosidade").textContent =
            dados.luminosidade + " lux";

    } catch (erro) {
        console.log("Erro ao carregar indicadores:", erro);
    }
}

// Mostra o histórico das últimas 24 horas
async function carregarHistorico() {
    const grafico = document.querySelector(".grafico");

    try {
        const resposta = await fetch(
            `${API_URL}/registros/dispositivo/${ID_DISPOSITIVO}/historico`
        );

        if (!resposta.ok) throw new Error("Erro ao buscar histórico");

        const registros = await resposta.json();
        const ontem = Date.now() - 24 * 60 * 60 * 1000;

        const recentes = registros
            .filter(registro => {
                const data = new Date(registro.dataHora).getTime();
                return data >= ontem && data <= Date.now();
            })
            .sort((a, b) =>
                new Date(a.dataHora) - new Date(b.dataHora)
            )
            .slice(-20);

        if (recentes.length === 0) {
            grafico.textContent =
                "Ainda não há medições nas últimas 24 horas.";
            return;
        }

        grafico.style.display = "block";
        grafico.innerHTML = `
            <h3>Temperaturas das últimas 24 horas</h3>
            ${recentes.map(registro => `
                <div style="padding: 6px; border-bottom: 1px solid #ddd;">
                    ${new Date(registro.dataHora).toLocaleTimeString("pt-BR")}
                    — ${registro.temperatura} °C
                </div>
            `).join("")}
        `;

    } catch (erro) {
        console.log("Erro ao carregar histórico:", erro);
        grafico.textContent = "Não foi possível carregar o histórico.";
    }
}

// Lista os dispositivos cadastrados no banco
async function carregarDispositivos() {
    const lista = document.getElementById("listaDispositivos");

    try {
        const resposta = await fetch(`${API_URL}/dispositivos`);
        if (!resposta.ok) throw new Error("Erro ao buscar dispositivos");

        const dispositivos = await resposta.json();

        if (dispositivos.length === 0) {
            lista.textContent = "Nenhum dispositivo cadastrado.";
            return;
        }

        lista.innerHTML = dispositivos.map(dispositivo => `
            <div class="dispositivo">
                <span>${dispositivo.nomeDispositivo}</span>
                <span>${dispositivo.localizacao || "--"}</span>
                <span>Cadastrado</span>
            </div>
        `).join("");

    } catch (erro) {
        console.log("Erro ao carregar dispositivos:", erro);
        lista.textContent = "Não foi possível carregar os dispositivos.";
    }
}

// Executa ao abrir a página
function atualizarDashboard() {
    carregarIndicadores();
    carregarHistorico();
}

document.addEventListener("DOMContentLoaded", () => {
    atualizarDashboard();
    carregarDispositivos();

    // Atualiza indicadores e histórico a cada 5 segundos
    setInterval(atualizarDashboard, 5000);
});
