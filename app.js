const STORAGE_KEY = "lia-simplis-prototipo";

const app = document.querySelector("#app");

const initialState = {
  route: "start",
  previousRoute: "start",
  name: "",
  textSize: "large",
  explanationMode: "both",
  selectedTraining: "Mensagem suspeita no WhatsApp",
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
  "Mensagem suspeita no WhatsApp": {
    shortTitle: "Treino: WhatsApp",
    scenario: "Mensagem Suspeita",
    minutes: "5 minutos",
    tag: "Recomendado",
  },
  "Pagamento por transferência instantânea": {
    shortTitle: "Treino: Pagamento",
    scenario: "Transferência instantânea",
    minutes: "3 minutos",
    tag: "Importante",
  },
};

const resultCopy = {
  safe: {
    title: "Boa escolha!",
    message: "Mensagens com pressa e link podem ser golpe.",
    footer: "Simulação concluída com sucesso. Nenhuma ação real foi executada.",
    mark: "✓",
  },
  risky: {
    title: "Vamos com calma",
    message: "Clicar em link recebido por mensagem pode trazer risco.",
    footer: "Essa foi só uma simulação. Nada real aconteceu.",
    mark: "!",
  },
  help: {
    title: "Boa atitude",
    message: "Pedir ajuda antes de clicar também é uma forma de se proteger.",
    footer: "Simulação concluída. Nenhuma mensagem real foi enviada.",
    mark: "✓",
  },
};

const deviceProblems = {
  internet: {
    label: "Estou sem internet",
    icon: "Wi",
    stepTitle: "Passo 1 de 3",
    step:
      "Veja se o Wi-Fi está ligado. Procure o símbolo de internet na parte de cima da tela.",
  },
  sound: {
    label: "O celular está sem som",
    icon: "Som",
    stepTitle: "Passo 1 de 3",
    step:
      "Aperte o botão de volume na lateral do celular e veja se aparece uma barra na tela.",
  },
  brightness: {
    label: "A tela está muito escura",
    icon: "Luz",
    stepTitle: "Passo 1 de 3",
    step:
      "Deslize o dedo de cima para baixo e procure o controle de brilho da tela.",
  },
  app: {
    label: "Um aplicativo travou",
    icon: "App",
    stepTitle: "Passo 1 de 3",
    step:
      "Feche o aplicativo e abra novamente. Se continuar travado, reinicie o celular.",
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
  app.scrollIntoView({ block: "start" });
}

function statusBar() {
  return `
    <div class="status-bar" aria-hidden="true">
      <span>9:41</span>
      <span class="status-icons">
        <span class="signal"><span></span><span></span><span></span></span>
        <span class="wifi"></span>
        <span class="battery"></span>
      </span>
    </div>
  `;
}

function topbar(title, options = {}) {
  const back = options.backRoute
    ? `<button class="icon-button" type="button" data-route="${options.backRoute}" aria-label="Voltar">‹</button>`
    : "";

  const brand = options.brand
    ? `<span class="brand"><span class="brand-mark">S</span>LiaSimplis</span>`
    : `<span class="topbar-title">${title}</span>`;

  return `
    ${statusBar()}
    <header class="topbar">
      ${back}
      ${brand}
      <button class="icon-button" type="button" data-action="speak" aria-label="Ouvir explicação">))</button>
      <button class="icon-button" type="button" data-action="toggle-text" aria-label="Alternar tamanho do texto">T</button>
    </header>
  `;
}

function renderStart() {
  return `
    <article class="screen screen-centered" data-screen="start">
      ${statusBar()}
      <div class="content stack-large">
        <div class="center">
          <div class="hero-mark" aria-hidden="true">✓</div>
          <h1 class="headline">Aprenda tecnologia <span class="accent">sem medo</span></h1>
          <p class="subtitle">Simulações seguras para o seu dia a dia.</p>
        </div>

        <label class="field">
          <span>Como posso te chamar?</span>
          <input
            type="text"
            name="name"
            value="${escapeHtml(state.name)}"
            placeholder="Digite seu nome"
            autocomplete="given-name"
            data-field="name"
          />
        </label>

        <section class="notice" aria-label="Aviso de Segurança">
          <div class="notice-title"><span class="brand-mark">S</span>Aviso de Segurança</div>
          <p class="body-copy"><strong>Nada real será enviado, pago ou alterado</strong> no seu celular durante o uso deste aplicativo.</p>
          <p class="notice-soft">Todas as mensagens e telas que você verá são apenas simulações fictícias para treino.</p>
        </section>

        <div class="stack">
          <button class="button button-primary" type="button" data-route="adjust">Começar ›</button>
          <button class="button" type="button" data-action="large-and-adjust">Preciso de texto maior</button>
        </div>
      </div>
      <p class="footer-note">Ao continuar, você confirma que entende que este é um ambiente de testes.</p>
    </article>
  `;
}

function renderAdjust() {
  return `
    <article class="screen" data-screen="adjust">
      ${topbar("Ajuste rápido", { backRoute: "start" })}
      <div class="content stack-large">
        <div>
          <h1 class="title">Personalize sua experiência</h1>
          <p class="subtitle">Escolha como você prefere ler e ouvir as explicações.</p>
        </div>

        <section class="option-group" aria-label="Tamanho do texto">
          <h2 class="option-label"><span aria-hidden="true">T</span>Tamanho do texto:</h2>
          ${choiceButton("textSize", "normal", "Normal")}
          ${choiceButton("textSize", "large", "Grande")}
        </section>

        <section class="option-group" aria-label="Modo de explicação">
          <h2 class="option-label"><span aria-hidden="true">))</span>Modo de explicação:</h2>
          ${choiceButton("explanationMode", "read", "Ler")}
          ${choiceButton("explanationMode", "listen", "Ouvir")}
          ${choiceButton("explanationMode", "both", "Os dois")}
        </section>

        <div class="spacer"></div>

        <div class="stack">
          <button class="button button-accent" type="button" data-route="home">Continuar</button>
          <p class="subtitle center">Você pode mudar isso depois.</p>
        </div>
      </div>
    </article>
  `;
}

function renderHome() {
  const name = state.name.trim();
  const greeting = name ? `Olá, ${escapeHtml(name)}.` : "Olá.";

  return `
    <article class="screen" data-screen="home">
      ${topbar("", { brand: true })}
      <div class="content stack-large">
        <div>
          <h1 class="title">${greeting}<br />O que você quer fazer hoje?</h1>
          <div class="title-mark" aria-hidden="true"></div>
        </div>

        <div class="home-grid">
          ${actionCard("trainings", "Livro", "Aprender e treinar", "Fazer exercícios práticos")}
          ${actionCard("deviceHelp", "Cel", "Consertar celular", "Resolver problemas técnicos")}
          ${actionCard("dictionary", "?", "Tirar dúvida", "Entender termos difíceis")}
          ${actionCard("trainings", "!", "Ver sinais de golpe", "Proteja seus dados agora")}
        </div>

        <section class="info-panel" aria-label="Lembrete de Segurança">
          <span class="square-icon">S</span>
          <div>
            <strong>Lembrete de Segurança</strong>
            <p>Tudo aqui é uma simulação. Sinta-se seguro para explorar e clicar.</p>
          </div>
        </section>
      </div>
    </article>
  `;
}

function renderTrainings() {
  return `
    <article class="screen" data-screen="trainings">
      ${topbar("Aprender e treinar", { backRoute: "home" })}
      <div class="content stack-large">
        <div>
          <h1 class="title">Escolha um treino</h1>
          <p class="subtitle">Selecione uma situação abaixo para praticar como se proteger na internet.</p>
        </div>

        <div class="stack">
          ${trainingButton("Mensagem suspeita no WhatsApp")}
          ${trainingButton("Pagamento por transferência instantânea")}
        </div>

        <div class="spacer"></div>
        <button class="button" type="button" data-route="home">‹ Voltar para o Início</button>
      </div>
      <p class="footer-note">LEMBRE-SE: NADA REAL SERÁ ALTERADO NO SEU CELULAR.</p>
    </article>
  `;
}

function renderTrainingStart() {
  const training = trainingDetails[state.selectedTraining];

  return `
    <article class="screen" data-screen="trainingStart">
      ${topbar(training.shortTitle, { backRoute: "trainings" })}
      <div class="content stack-large">
        <div class="message-header">
          <span class="icon-button" aria-hidden="true">□</span>
          <div>
            <h1 class="title" style="margin:0">CENÁRIO</h1>
            <p class="subtitle">${training.scenario}</p>
          </div>
        </div>

        <section class="safe-ribbon" aria-label="Aviso importante">
          <strong>AVISO IMPORTANTE</strong>
          <p class="body-copy"><strong>Isto é apenas um treino de segurança.</strong></p>
          <p class="body-copy">Nenhuma mensagem real será enviada e nenhum dado será alterado no seu celular.</p>
          <p class="body-copy"><strong><u>Ambiente 100% seguro.</u></strong></p>
        </section>

        <section class="stack" aria-label="O que vamos aprender">
          <h2 class="option-label">O que vamos aprender?</h2>
          <ol class="number-list">
            <li><span class="number">1</span><span>Identificar uma mensagem de banco falsa.</span></li>
            <li><span class="number">2</span><span>Saber onde clicar para se proteger.</span></li>
          </ol>
        </section>

        <div class="spacer"></div>
        <div class="stack">
          <button class="button button-primary" type="button" data-route="simulation">▷ COMEÇAR TREINO</button>
          <button class="button" type="button" data-route="trainings">VOLTAR</button>
        </div>
      </div>
    </article>
  `;
}

function renderSimulation() {
  return `
    <article class="screen" data-screen="simulation">
      ${topbar("Simulação de Risco", { backRoute: "trainingStart" })}
      <div class="content stack-large">
        <h1 class="title">Você recebeu esta mensagem no seu celular:</h1>

        <section class="message-card" aria-label="Mensagem fictícia">
          <span class="fiction-badge">FICTÍCIO</span>
          <div class="message-header">
            <span class="square-icon">Msg</span>
            <div>
              <div class="message-title">SMS: DESCONHECIDO</div>
              <div class="message-time">Enviado agora</div>
            </div>
          </div>
          <p class="message-text">"Prezado cliente, seu <u>acesso bancário</u> foi bloqueado por suspeita de fraude."</p>
          <p class="message-text">"Para desbloquear agora, utilize o link abaixo:"</p>
          <span class="fake-link">bit.ly/ajuda-banco-seguro</span>
        </section>

        <section class="stack" aria-label="Escolha uma resposta">
          <h2 class="option-label center">O que você faria?</h2>
          <button class="button button-primary" type="button" data-answer="safe">Não clicar no link</button>
          <button class="button" type="button" data-answer="risky">Clicar para resolver</button>
          <button class="button" type="button" data-answer="help">Pedir ajuda</button>
        </section>

        <section class="notice" aria-label="Ambiente Seguro">
          <div class="notice-title"><span class="brand-mark">S</span>Ambiente Seguro</div>
          <p class="body-copy">Esta é uma simulação educativa. Nenhuma mensagem real será enviada e seu banco não será afetado.</p>
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
      <div class="content stack-large">
        <section class="result-hero">
          <div class="result-ring" aria-hidden="true"><span>${result.mark}</span></div>
          <h1 class="title">${result.title}</h1>
        </section>

        <p class="result-message">${result.message}</p>

        <section class="stack" aria-label="Próximo passo">
          <div class="section-kicker center">O que deseja fazer agora?</div>
          <button class="button button-primary" type="button" data-route="trainings">↻ Fazer outro treino</button>
          <button class="button" type="button" data-route="dictionary">? O que é link?</button>
          <button class="button button-dashed" type="button" data-route="home">‹ Voltar para início</button>
        </section>
      </div>
      <p class="footer-note">${result.footer}</p>
    </article>
  `;
}

function renderDictionary() {
  return `
    <article class="screen" data-screen="dictionary">
      ${topbar("O que é link?", { backRoute: state.previousRoute === "result" ? "result" : "home" })}
      <div class="content stack-large">
        <section class="dictionary-hero" aria-label="Dicionário Digital">
          <span class="round-icon">○</span>
          <strong class="pill">Dicionário Digital</strong>
        </section>

        <h1 class="title">Pense no link como um botão invisível.</h1>

        <p class="dictionary-card">Um <u>link</u> é um caminho que abre uma página, foto, vídeo ou aplicativo.</p>

        <p class="dictionary-tip"><span class="round-icon" style="width:34px;height:34px;font-size:1rem">i</span><span>"Geralmente ele aparece em azul ou sublinhado nas mensagens que você recebe."</span></p>

        <span class="example-link">www.exemplo.com.br <span>›</span></span>

        <div class="spacer"></div>
        <div class="stack">
          <button class="button button-primary" type="button" data-route="home">Entendi</button>
          <button class="button" type="button" data-action="speak">)) Ouvir explicação</button>
        </div>
      </div>
      <p class="footer-note" style="background:var(--color-text);color:var(--color-base);font-style:normal">SIMULAÇÃO EDUCATIVA LIASIMPLIS</p>
    </article>
  `;
}

function renderDeviceHelp() {
  const current = deviceProblems[state.deviceProblem];

  return `
    <article class="screen" data-screen="deviceHelp">
      ${topbar("Conserta Celular", { backRoute: "home" })}
      <div class="content stack-large">
        <div>
          <h1 class="title">Resolver problema no celular</h1>
          <p class="subtitle">Escolha o problema que está acontecendo agora:</p>
        </div>

        <div class="device-list">
          ${Object.entries(deviceProblems)
            .map(([key, item]) => deviceButton(key, item))
            .join("")}
        </div>

        <section class="step-panel" aria-label="Passo a passo">
          <h3>${current.label}</h3>
          <strong>${current.stepTitle}</strong>
          <p>${current.step}</p>
          <button class="button" type="button" data-action="done-step">Já conferi</button>
        </section>

        <div class="spacer"></div>
        <button class="button" type="button" data-route="home">‹ Voltar para o Início</button>
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
      ${isSelected ? '<span class="checkmark">✓</span>' : ""}
    </button>
  `;
}

function actionCard(route, icon, title, text) {
  return `
    <button class="action-card" type="button" data-route="${route}">
      <span class="round-icon" aria-hidden="true">${icon}</span>
      <span class="action-card-title">${title}</span>
      <p>${text}</p>
      <span class="link-label">Tocar ›</span>
    </button>
  `;
}

function trainingButton(name) {
  const details = trainingDetails[name];

  return `
    <div>
      <div class="training-meta"><span class="pill">${details.tag}</span><span>${details.minutes}</span></div>
      <button class="button button-primary training-button" type="button" data-training="${name}">${name}</button>
    </div>
  `;
}

function deviceButton(key, item) {
  const selected = state.deviceProblem === key;

  return `
    <button class="device-item ${selected ? "is-selected" : ""}" type="button" data-device="${key}">
      <span class="square-icon" aria-hidden="true">${item.icon}</span>
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
    showToast("Certo. No aplicativo final, o próximo passo apareceria aqui.");
  }
}

function speakScreen() {
  const text = app.innerText
    .replace(/\s+/g, " ")
    .replace("9:41", "")
    .trim()
    .slice(0, 420);

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

  window.setTimeout(() => toast.remove(), 2800);
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
