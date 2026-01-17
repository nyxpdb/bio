// ═══════════════════════════════════════════
// LANYARD WEBSOCKET CONNECTION
// ═══════════════════════════════════════════

let lanyardSocket = null;
let loadingTimeout = null;
let hasReceivedData = false;

function connectToLanyard() {
    hasReceivedData = false;

    // Configurar timeout para carregamento
    loadingTimeout = setTimeout(() => {
        if (!hasReceivedData) {
            console.error('⏱️ Timeout: Não foi possível carregar dados do Discord');
            showError();
        }
    }, LOADING_TIMEOUT);

    try {
        lanyardSocket = new WebSocket('wss://api.lanyard.rest/socket');

        lanyardSocket.onopen = () => {
            console.log('🟢 Conectado ao Lanyard');
        };

        lanyardSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.op) {
                case 1: // Hello
                    lanyardSocket.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: DISCORD_USER_ID }
                    }));

                    // Heartbeat
                    setInterval(() => {
                        if (lanyardSocket.readyState === WebSocket.OPEN) {
                            lanyardSocket.send(JSON.stringify({ op: 3 }));
                        }
                    }, message.d.heartbeat_interval);
                    break;

                case 0: // Event
                    if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
                        hasReceivedData = true;
                        clearTimeout(loadingTimeout);
                        updateProfile(message.d);
                    }
                    break;
            }
        };

        lanyardSocket.onclose = () => {
            console.log('🔴 Desconectado do Lanyard');
            if (hasReceivedData) {
                // Só reconecta se já tiver recebido dados antes
                setTimeout(connectToLanyard, 5000);
            }
        };

        lanyardSocket.onerror = (error) => {
            console.error('❌ Erro no WebSocket Lanyard:', error);
            if (!hasReceivedData) {
                clearTimeout(loadingTimeout);
                showError();
            }
        };
    } catch (error) {
        console.error('❌ Erro ao conectar:', error);
        clearTimeout(loadingTimeout);
        showError();
    }
}

function showError() {
    const skeletonLoader = document.getElementById('skeletonLoader');
    const profileContent = document.getElementById('profileContent');

    skeletonLoader.classList.add('hidden');
    profileContent.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Erro ao Carregar</h3>
            <p>Não foi possível carregar as informações do Discord.</p>
            <p style="font-size: 0.8rem; margin-bottom: 1.5rem;">Verifique se o ID do Discord está correto no arquivo config.js</p>
            <button class="retry-button" onclick="retryConnection()">Tentar Novamente</button>
        </div>
    `;
    profileContent.classList.remove('hidden');
}

function retryConnection() {
    const profileContent = document.getElementById('profileContent');
    const skeletonLoader = document.getElementById('skeletonLoader');

    profileContent.classList.add('hidden');
    skeletonLoader.classList.remove('hidden');

    // Aguardar um pouco antes de reconectar
    setTimeout(() => {
        connectToLanyard();
    }, 500);
}
