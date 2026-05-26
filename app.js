const STORAGE_KEY = "lia-simplis-prototipo";

const app = document.querySelector("#app");

const initialState = {
  route: "start",
  previousRoute: "start",
  name: "",
  textSize: "large",
  explanationMode: "both",
  selectedTraining: "Mensagem suspeita",
  selectedAnswer: "safe",
  deviceProblem: "internet",
};

const state = {
  ...initialState,
  ...readStoredState(),
};

const screens = {
  start: renderStart,
  adjust: renderAdjust,
  home: renderHome,
  trainings: renderTrainings,
  trainingStart: renderTrainingStart,
  simulation: renderSimulation,
  result: renderResult,
  dictionary: renderDictionary,
  deviceHelp: renderDeviceHelp,
};

const trainingDetails = {
  "Mensagem suspeita": {
    title: "Mensagem suspeita",
    subtitle: "Treino de golpe por mensagem",
    minutes: "5 min",
    tag: "Recomendado",
    icon: "chat",
  },
  "Transferência instantânea": {
    title: "Transferência instantânea",
    subtitle: "Treino sem dinheiro real",
    minutes: "3 min",
    tag: "Importante",
    icon: "payments",
  },
};

const resultCopy = {
  safe: {
    title: "Boa escolha!",
    icon: "check_circle",
    message: "Mensagem com pressa e link pode ser golpe.",
    detail: "O melhor é não clicar e procurar um canal oficial.",
  },
  risky: {
    title: "Vamos com calma",
    icon: "warning",
    message: "Clicar em link recebido por mensagem pode trazer risco.",
    detail: "Como é treino, nada real aconteceu. Agora você sabe o sinal de alerta.",
  },
  help: {
    title: "Boa atitude",
    icon: "support_agent",
    message: "Pedir ajuda antes de clicar também protege você.",
    detail: "Na dúvida, fale com alguém de confiança ou procure o canal oficial.",
  },
};

const deviceProblems = {
  internet: {
    label: "Estou sem internet",
    icon: "wifi_off",
    stepTitle: "Passo 1 de 3",
    step: "Veja se o Wi-Fi está ligado no topo da tela.",
  },
  sound: {
    label: "Celular sem som",
    icon: "volume_off",
    stepTitle: "Passo 1 de 3",
    step: "Aperte o volume lateral e confira se o som não está no silencioso.",
  },
  brightness: {
    label: "Tela muito escura",
    icon: "brightness_6",
    stepTitle: "Passo 1 de 3",
    step: "Abra os controles rápidos e aumente o brilho.",
  },
  app: {
    label: "Aplicativo travou",
    icon: "app_blocking",
    stepTitle: "Passo 1 de 3",
    step: "Feche o aplicativo e abra novamente.",
  },
};

function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: state.name,
      textSize: state.textSize,
      explanationMode: state.explanationMode,
      selectedTraining: state.selectedTraining,
      deviceProblem: state.deviceProblem,
    }),
  );
}

function setRoute(route) {
  state.previousRoute = state.route;
  state.route = route;
  persistState();
  render();
}

function render() {
  app.classList.toggle("text-large", state.textSize === "large");
  app.innerHTML = screens[state.route]();
  bindEvents();
}

function icon(name, extraClass = "") {
  return `<span class="material-symbols-rounded ${extraClass}" aria-hidden="true">${name}</span>`;
}

function statusBar() {
  return `
    <div class="status-bar" aria-hidden="true">
      <span>9:41</span>
      <span class="status-icons">
        ${icon("signal_cellular_alt")}
        ${icon("wifi")}
        ${icon("battery_full")}
      </span>
    </div>
  `;
}

function topbar(title, options = {}) {
  const back = options.backRoute
    ? `<button class="icon-button" type="button" data-route="${options.backRoute}" aria-label="Voltar">${icon("arrow_back")}</button>`
    : "";

  const brand = options.brand
    ? `<span class="brand"><span class="brand-mark">${icon("shield")}</span>LiaSimplis</span>`
    : `<span class="topbar-title">${title}</span>`;

  return `
    ${statusBar()}
    <header class="topbar">
      ${back}
      ${brand}
      <button class="icon-button" type="button" data-action="speak" aria-label="Ouvir explicação">${icon("volume_up")}</button>
      <button class="icon-button" type="button" data-action="toggle-text" aria-label="Alternar tamanho do texto">${icon("text_fields")}</button>
    </header>
  `;
}

function renderStart() {
  return `
    <article class="screen screen-start" data-screen="start">
      ${statusBar()}
      <div class="content">
        <section class="hero-block center">
          <div class="hero-mark">${icon("verified_user")}</div>
          <h1 class="headline">Aprenda tecnologia <span class="accent">sem medo</span></h1>
          <p class="subtitle">Treinos seguros para o dia a dia.</p>
        </section>

        <label class="field">
          <span>Seu nome</span>
          <input
            type="text"
            name="name"
            value="${escapeHtml(state.name)}"
            placeholder="Digite seu nome"
            autocomplete="given-name"
            data-field="name"
          />
        </label>

        <section class="notice compact-notice" aria-label="Aviso de Segurança">
          <div class="notice-title"><span class="brand-mark">${icon("shield")}</span>Aviso de Segurança</div>
          <p class="body-copy"><strong>Nada real será enviado, pago ou alterado.</strong></p>
          <p class="notice-soft">Tudo aqui é simulação fictícia para treino.</p>
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="adjust">Começar ${icon("arrow_forward")}</button>
          <button class="button" type="button" data-action="large-and-adjust">${icon("text_increase")} Texto maior</button>
        </div>
      </div>
    </article>
  `;
}

function renderAdjust() {
  return `
    <article class="screen" data-screen="adjust">
      ${topbar("Ajuste rápido", { backRoute: "start" })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">Como você prefere usar?</h1>
          <p class="subtitle">Essas opções podem mudar depois.</p>
        </section>

        <section class="option-group" aria-label="Tamanho do texto">
          <h2 class="option-label">${icon("text_fields")}Tamanho do texto</h2>
          ${choiceButton("textSize", "normal", "Normal")}
          ${choiceButton("textSize", "large", "Grande")}
        </section>

        <section class="option-group" aria-label="Modo de explicação">
          <h2 class="option-label">${icon("record_voice_over")}Explicação</h2>
          ${choiceButton("explanationMode", "read", "Ler")}
          ${choiceButton("explanationMode", "listen", "Ouvir")}
          ${choiceButton("explanationMode", "both", "Os dois")}
        </section>

        <div class="screen-actions">
          <button class="button button-accent" type="button" data-route="home">Continuar</button>
        </div>
      </div>
    </article>
  `;
}

function renderHome() {
  const name = state.name.trim();
  const greeting = name ? `Bem-vindo(a), ${escapeHtml(name)}!` : "Bem-vindo(a)!";

  return `
    <article class="screen" data-screen="home">
      ${topbar("", { brand: true })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">${greeting}</h1>
          <p class="subtitle">Como podemos ajudar hoje?</p>
        </section>

        <div class="home-grid">
          ${actionCard("trainings", "menu_book", "Aprender e treinar", "Exercícios práticos")}
          ${actionCard("deviceHelp", "smartphone", "Consertar celular", "Ajuda rápida")}
          ${actionCard("dictionary", "help", "Tirar dúvida", "Palavras simples")}
          ${actionCard("trainings", "security", "Ver sinais de golpe", "Proteção")}
        </div>

        <section class="info-panel" aria-label="Lembrete de Segurança">
          <span class="square-icon">${icon("gpp_good")}</span>
          <div>
            <strong>Lembrete de Segurança</strong>
            <p>Tudo aqui é uma simulação segura.</p>
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderTrainings() {
  return `
    <article class="screen" data-screen="trainings">
      ${topbar("Aprender", { backRoute: "home" })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">Escolha um treino</h1>
          <p class="subtitle">Pratique situações comuns sem risco.</p>
        </section>

        <div class="training-list">
          ${trainingButton("Mensagem suspeita")}
          ${trainingButton("Transferência instantânea")}
        </div>

        <section class="notice mini-notice">
          <div class="notice-title"><span class="brand-mark">${icon("lock")}</span>Nada real será alterado.</div>
        </section>

        <div class="screen-actions">
          <button class="button" type="button" data-route="home">${icon("home")} Início</button>
        </div>
      </div>
    </article>
  `;
}

function renderTrainingStart() {
  const training = trainingDetails[state.selectedTraining];

  return `
    <article class="screen" data-screen="trainingStart">
      ${topbar("Treino", { backRoute: "trainings" })}
      <div class="content">
        <section class="scenario-header">
          <span class="square-icon">${icon(training.icon)}</span>
          <div>
            <strong>Cenário</strong>
            <p>${training.title}</p>
          </div>
        </section>

        <section class="safe-ribbon" aria-label="Aviso importante">
          <strong>Aviso importante</strong>
          <p class="body-copy">Isto é apenas um treino de segurança.</p>
          <p class="body-copy">Nenhuma mensagem real será enviada.</p>
        </section>

        <section class="learn-list" aria-label="O que vamos aprender">
          <h2 class="option-label">${icon("checklist")}Você vai aprender</h2>
          <ol class="number-list">
            <li><span class="number">1</span><span>Identificar sinal de golpe.</span></li>
            <li><span class="number">2</span><span>Escolher uma ação segura.</span></li>
          </ol>
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="simulation">${icon("play_arrow")} Começar treino</button>
          <button class="button" type="button" data-route="trainings">Voltar</button>
        </div>
      </div>
    </article>
  `;
}

function renderSimulation() {
  return `
    <article class="screen" data-screen="simulation">
      ${topbar("Simulação", { backRoute: "trainingStart" })}
      <div class="content">
        <section class="screen-heading compact-heading">
          <h1 class="title">Mensagem recebida</h1>
          <p class="subtitle">Esta mensagem é fictícia.</p>
        </section>

        <section class="message-card" aria-label="Mensagem fictícia">
          <span class="fiction-badge">Fictício</span>
          <div class="message-header">
            <span class="square-icon">${icon("sms")}</span>
            <div>
              <div class="message-title">SMS desconhecido</div>
              <div class="message-time">Enviado agora</div>
            </div>
          </div>
          <p class="message-text">"Seu acesso bancário foi bloqueado por suspeita."</p>
          <span class="fake-link">bit.ly/ajuda-banco</span>
        </section>

        <section class="answer-panel" aria-label="Escolha uma resposta">
          <h2 class="option-label center">O que você faria?</h2>
          <button class="button button-primary" type="button" data-answer="safe">Não clicar</button>
          <button class="button" type="button" data-answer="risky">Clicar</button>
          <button class="button" type="button" data-answer="help">Pedir ajuda</button>
        </section>

        <section class="notice mini-notice">
          <div class="notice-title"><span class="brand-mark">${icon("shield")}</span>Ambiente seguro</div>
        </section>
      </div>
    </article>
  `;
}

function renderResult() {
  const result = resultCopy[state.selectedAnswer] || resultCopy.safe;

  return `
    <article class="screen" data-screen="result">
      ${topbar("Resultado", { backRoute: "simulation" })}
      <div class="content">
        <section class="result-hero">
          <div class="result-ring">${icon(result.icon)}</div>
          <h1 class="title">${result.title}</h1>
        </section>

        <section class="result-message">
          <strong>${result.message}</strong>
          <span>${result.detail}</span>
        </section>

        <section class="screen-actions">
          <button class="button button-primary" type="button" data-route="trainings">${icon("restart_alt")} Outro treino</button>
          <button class="button" type="button" data-route="dictionary">${icon("help")} O que é link?</button>
          <button class="button button-dashed" type="button" data-route="home">${icon("home")} Início</button>
        </section>
      </div>
    </article>
  `;
}

function renderDictionary() {
  return `
    <article class="screen" data-screen="dictionary">
      ${topbar("Dicionário", { backRoute: state.previousRoute === "result" ? "result" : "home" })}
      <div class="content">
        <section class="dictionary-hero" aria-label="Dicionário Digital">
          <span class="round-icon">${icon("language")}</span>
          <strong class="pill">Dicionário Digital</strong>
        </section>

        <section class="screen-heading">
          <h1 class="title">O que é link?</h1>
          <p class="subtitle">Pense no link como um caminho.</p>
        </section>

        <p class="dictionary-card">Um link abre uma página, foto, vídeo ou aplicativo.</p>

        <p class="dictionary-tip"><span class="mini-icon">${icon("info")}</span><span>Geralmente aparece em azul ou sublinhado.</span></p>

        <span class="example-link">www.exemplo.com.br ${icon("open_in_new")}</span>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="home">Entendi</button>
          <button class="button" type="button" data-action="speak">${icon("volume_up")} Ouvir</button>
        </div>
      </div>
    </article>
  `;
}

function renderDeviceHelp() {
  const current = deviceProblems[state.deviceProblem];

  return `
    <article class="screen" data-screen="deviceHelp">
      ${topbar("Conserta Celular", { backRoute: "home" })}
      <div class="content">
        <section class="screen-heading compact-heading">
          <h1 class="title">Qual é o problema?</h1>
          <p class="subtitle">Escolha uma opção.</p>
        </section>

        <div class="device-list">
          ${Object.entries(deviceProblems)
            .map(([key, item]) => deviceButton(key, item))
            .join("")}
        </div>

        <section class="step-panel" aria-label="Passo a passo">
          <h3>${current.label}</h3>
          <strong>${current.stepTitle}</strong>
          <p>${current.step}</p>
          <button class="button button-small" type="button" data-action="done-step">Já conferi</button>
        </section>

        <div class="screen-actions">
          <button class="button" type="button" data-route="home">${icon("home")} Início</button>
        </div>
      </div>
    </article>
  `;
}

function choiceButton(field, value, label) {
  const isSelected = state[field] === value;

  return `
    <button
      class="choice ${isSelected ? "is-selected" : ""}"
      type="button"
      data-choice-field="${field}"
      data-choice-value="${value}"
    >
      <span>${label}</span>
      ${isSelected ? icon("check") : ""}
    </button>
  `;
}

function actionCard(route, iconName, title, text) {
  return `
    <button class="action-card" type="button" data-route="${route}">
      <span class="round-icon">${icon(iconName)}</span>
      <span class="action-card-title">${title}</span>
      <p>${text}</p>
    </button>
  `;
}

function trainingButton(name) {
  const details = trainingDetails[name];

  return `
    <button class="training-card" type="button" data-training="${name}">
      <span class="square-icon">${icon(details.icon)}</span>
      <span>
        <strong>${details.title}</strong>
        <small>${details.tag} · ${details.minutes}</small>
      </span>
      ${icon("arrow_forward_ios", "end-icon")}
    </button>
  `;
}

function deviceButton(key, item) {
  const selected = state.deviceProblem === key;

  return `
    <button class="device-item ${selected ? "is-selected" : ""}" type="button" data-device="${key}">
      <span class="square-icon">${icon(item.icon)}</span>
      <span>${item.label}</span>
    </button>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => setRoute(element.dataset.route));
  });

  app.querySelectorAll("[data-choice-field]").forEach((element) => {
    element.addEventListener("click", () => {
      state[element.dataset.choiceField] = element.dataset.choiceValue;
      persistState();
      render();
    });
  });

  app.querySelectorAll("[data-training]").forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedTraining = element.dataset.training;
      persistState();
      setRoute("trainingStart");
    });
  });

  app.querySelectorAll("[data-answer]").forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedAnswer = element.dataset.answer;
      persistState();
      setRoute("result");
    });
  });

  app.querySelectorAll("[data-device]").forEach((element) => {
    element.addEventListener("click", () => {
      state.deviceProblem = element.dataset.device;
      persistState();
      render();
    });
  });

  app.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", () => handleAction(element.dataset.action));
  });

  app.querySelectorAll("[data-field='name']").forEach((element) => {
    element.addEventListener("input", () => {
      state.name = element.value;
      persistState();
    });
  });
}

function handleAction(action) {
  if (action === "toggle-text") {
    state.textSize = state.textSize === "large" ? "normal" : "large";
    persistState();
    render();
    return;
  }

  if (action === "large-and-adjust") {
    state.textSize = "large";
    persistState();
    setRoute("adjust");
    return;
  }

  if (action === "speak") {
    speakScreen();
    return;
  }

  if (action === "done-step") {
    showToast("Certo. No app final, o próximo passo aparece aqui.");
  }
}

function speakScreen() {
  const text = app.innerText
    .replace(/\s+/g, " ")
    .replace("9:41", "")
    .trim()
    .slice(0, 380);

  if (!("speechSynthesis" in window)) {
    showToast("Este navegador não tem leitura em voz alta disponível.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function showToast(message) {
  const previous = document.querySelector(".toast");
  previous?.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);

  window.setTimeout(() => toast.remove(), 2600);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
