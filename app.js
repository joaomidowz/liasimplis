const STORAGE_KEY = "lia-simplis-prototipo";

const app = document.querySelector("#app");

const textSizes = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Grande" },
  { value: "extra", label: "Maior" },
  { value: "huge", label: "Muito grande" },
];

const explanationModes = [
  { value: "read", label: "Ler" },
  { value: "listen", label: "Ouvir" },
  { value: "both", label: "Os dois" },
];

const deviceBrands = ["Detectado", "Samsung", "Motorola", "Xiaomi", "iPhone"];

const detectedDevice = detectDeviceBrand();
let availableVoices = [];

if ("speechSynthesis" in window) {
  availableVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
}

const initialState = {
  route: "start",
  previousRoute: "start",
  name: "",
  textSize: "large",
  explanationMode: "both",
  deviceBrand: detectedDevice,
  selectedTraining: "Mensagem suspeita",
  currentScenarioId: "msg-1",
  selectedAnswer: "safe",
  activeTerm: "link",
  deviceProblem: "internet",
  showDeviceGuide: true,
  progress: {
    completed: 0,
    protectedChoices: 0,
    lastRoute: "home",
    lastTraining: "Mensagem suspeita",
    favoriteTerms: [],
  },
};

const state = mergeState(initialState, readStoredState());

const screens = {
  start: renderStart,
  adjust: renderAdjust,
  home: renderHome,
  trainings: renderTrainings,
  trainingStart: renderTrainingStart,
  simulation: renderSimulation,
  result: renderResult,
  dictionary: renderDictionary,
  conclusion: renderConclusion,
  deviceHelp: renderDeviceHelp,
  favorites: renderFavorites,
};

const trainingDetails = {
  "Mensagem suspeita": {
    title: "Mensagem suspeita",
    subtitle: "Golpes por SMS ou aplicativo",
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

const scenarios = {
  "Mensagem suspeita": [
    {
      id: "msg-1",
      sender: "SMS desconhecido",
      title: "Conta bloqueada",
      message: "Seu acesso bancário foi bloqueado. Clique para resolver agora.",
      link: "bit.ly/ajuda-banco",
      clue: "Pressa + link encurtado",
      safeAction: "Não clicar no link.",
    },
    {
      id: "msg-2",
      sender: "Número estranho",
      title: "Prêmio falso",
      message: "Você ganhou um prêmio. Envie seus dados para receber hoje.",
      link: "premio-agora.info",
      clue: "Promessa boa demais",
      safeAction: "Não enviar dados.",
    },
    {
      id: "msg-3",
      sender: "Entrega urgente",
      title: "Taxa de entrega",
      message: "Sua entrega está parada. Pague uma pequena taxa para liberar.",
      link: "taxa-entrega.net",
      clue: "Cobrança inesperada",
      safeAction: "Conferir no app oficial.",
    },
    {
      id: "msg-4",
      sender: "Suporte falso",
      title: "Código de verificação",
      message: "Informe o código que chegou por SMS para confirmar sua conta.",
      link: "Sem link",
      clue: "Pedido de código pessoal",
      safeAction: "Nunca passar código.",
    },
    {
      id: "msg-5",
      sender: "Contato novo",
      title: "Pedido de dinheiro",
      message: "Oi, troquei de número. Preciso de uma transferência urgente.",
      link: "Sem link",
      clue: "Urgência + número novo",
      safeAction: "Ligar para confirmar.",
    },
    {
      id: "msg-6",
      sender: "Promoção",
      title: "Cadastro suspeito",
      message: "Atualize seus dados para não perder o benefício.",
      link: "beneficio-seguro.online",
      clue: "Ameaça de perder benefício",
      safeAction: "Procurar canal oficial.",
    },
  ],
  "Transferência instantânea": [
    {
      id: "pix-1",
      sender: "Tela de treino",
      title: "Chave desconhecida",
      message: "A chave de pagamento não parece ser da pessoa combinada.",
      link: "treino sem dinheiro real",
      clue: "Nome diferente do combinado",
      safeAction: "Conferir antes de confirmar.",
    },
    {
      id: "pix-2",
      sender: "Tela de treino",
      title: "Valor alterado",
      message: "O valor ficou maior do que o combinado na conversa.",
      link: "treino sem dinheiro real",
      clue: "Valor divergente",
      safeAction: "Parar e revisar.",
    },
    {
      id: "pix-3",
      sender: "Tela de treino",
      title: "Pedido com pressa",
      message: "A pessoa insiste para pagar agora sem conferir os dados.",
      link: "treino sem dinheiro real",
      clue: "Pressão para agir rápido",
      safeAction: "Pedir ajuda ou confirmar.",
    },
  ],
};

const resultCopy = {
  safe: {
    icon: "verified_user",
    title: "Boa escolha",
    message: "Você parou antes de agir.",
    detail: "Quando houver pressa, link estranho ou pedido de código, confira em um canal oficial.",
  },
  help: {
    icon: "support_agent",
    title: "Escolha segura",
    message: "Pedir ajuda é uma boa decisão.",
    detail: "Conversar com alguém de confiança evita clicar, pagar ou enviar dados por impulso.",
  },
  risky: {
    icon: "warning",
    title: "Atenção",
    message: "Essa opção poderia colocar você em risco.",
    detail: "Em uma situação real, pare, não clique e confirme a informação por outro caminho.",
  },
};

const dictionaryTerms = {
  link: {
    title: "Link",
    icon: "link",
    short: "Um caminho que abre uma página, foto, vídeo ou aplicativo.",
    example: "Geralmente aparece azul, sublinhado ou dentro de um botão.",
    alert: "Cuidado com links enviados por desconhecidos.",
  },
  golpe: {
    title: "Golpe",
    icon: "security",
    short: "Uma tentativa de enganar alguém para roubar dados ou dinheiro.",
    example: "Pode aparecer como mensagem urgente, prêmio ou falsa cobrança.",
    alert: "Desconfie de pressa, ameaça e pedido de senha.",
  },
  senha: {
    title: "Senha",
    icon: "password",
    short: "Uma chave pessoal usada para entrar em contas e aplicativos.",
    example: "Ela deve ser guardada como segredo.",
    alert: "Nunca envie senha por mensagem.",
  },
  wifi: {
    title: "Wi-Fi",
    icon: "wifi",
    short: "Internet sem fio usada pelo celular dentro de casa ou lugares públicos.",
    example: "O símbolo costuma aparecer no topo da tela.",
    alert: "Evite redes desconhecidas para acessar banco.",
  },
  codigo: {
    title: "Código",
    icon: "pin",
    short: "Números enviados para confirmar que é você usando a conta.",
    example: "Pode chegar por SMS ou aplicativo.",
    alert: "Não passe esse código para outras pessoas.",
  },
};

const deviceHelpDatabase = {
  internet: {
    title: "Estou sem internet",
    icon: "wifi_off",
    steps: {
      Samsung: ["Abra o painel rápido.", "Toque em Wi-Fi.", "Escolha sua rede de casa."],
      Motorola: ["Puxe a tela de cima para baixo.", "Segure Wi-Fi.", "Conecte na rede conhecida."],
      Xiaomi: ["Abra a Central de controle.", "Ative Wi-Fi.", "Confira se os dados móveis estão ligados."],
      iPhone: ["Abra a Central de Controle.", "Toque no ícone Wi-Fi.", "Confira se há sinal."],
      Detectado: ["Abra os atalhos rápidos.", "Confira Wi-Fi e dados móveis.", "Tente abrir um site simples."],
    },
    visual: "Painel rápido com o botão Wi-Fi destacado.",
  },
  sound: {
    title: "Celular sem som",
    icon: "volume_off",
    steps: {
      Samsung: ["Aperte volume para cima.", "Toque nos três pontos.", "Aumente mídia e toque."],
      Motorola: ["Aperte o botão de volume.", "Desative o modo silencioso.", "Teste uma música."],
      Xiaomi: ["Aperte volume para cima.", "Abra controles de som.", "Confira se não está no silencioso."],
      iPhone: ["Confira a chave lateral.", "Aumente o volume.", "Teste um vídeo curto."],
      Detectado: ["Aperte volume para cima.", "Confira modo silencioso.", "Teste o áudio."],
    },
    visual: "Controle de volume com barra de som visível.",
  },
  brightness: {
    title: "Tela muito escura",
    icon: "brightness_6",
    steps: {
      Samsung: ["Abra o painel rápido.", "Arraste a barra de brilho.", "Desative brilho extra baixo."],
      Motorola: ["Puxe os atalhos rápidos.", "Aumente a barra de brilho.", "Confira brilho adaptável."],
      Xiaomi: ["Abra a Central de controle.", "Aumente o brilho.", "Desative modo escuro se precisar."],
      iPhone: ["Abra a Central de Controle.", "Arraste o brilho para cima.", "Confira modo baixo consumo."],
      Detectado: ["Abra os atalhos rápidos.", "Aumente o brilho.", "Procure modo economia."],
    },
    visual: "Barra de brilho no centro da tela.",
  },
  app: {
    title: "Aplicativo travou",
    icon: "app_blocking",
    steps: {
      Samsung: ["Abra apps recentes.", "Feche o app travado.", "Abra novamente."],
      Motorola: ["Toque no botão de apps recentes.", "Arraste o app para cima.", "Abra de novo."],
      Xiaomi: ["Abra apps recentes.", "Feche o app.", "Se continuar, reinicie o celular."],
      iPhone: ["Abra a troca de apps.", "Deslize o app para cima.", "Abra novamente."],
      Detectado: ["Feche o aplicativo.", "Abra novamente.", "Reinicie se continuar travado."],
    },
    visual: "Lista de apps recentes com um app sendo fechado.",
  },
};

function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function mergeState(base, stored) {
  return {
    ...base,
    ...stored,
    progress: {
      ...base.progress,
      ...(stored.progress || {}),
      favoriteTerms: stored.progress?.favoriteTerms || base.progress.favoriteTerms,
    },
  };
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setRoute(route) {
  if (!screens[route]) {
    route = "home";
  }

  state.previousRoute = state.route;
  state.route = route;

  if (!["start", "adjust"].includes(route)) {
    state.progress.lastRoute = route;
  }

  persistState();
  render();
}

function startTraining(name) {
  state.selectedTraining = name;
  state.currentScenarioId = pickRandomScenario(name).id;
  state.progress.lastTraining = name;
  setRoute("trainingStart");
}

function pickRandomScenario(trainingName = state.selectedTraining) {
  const list = scenarios[trainingName] || scenarios["Mensagem suspeita"];
  const currentIndex = list.findIndex((item) => item.id === state.currentScenarioId);
  const options = list.filter((_, index) => index !== currentIndex);
  const source = options.length ? options : list;
  return source[Math.floor(Math.random() * source.length)];
}

function currentScenario() {
  const list = scenarios[state.selectedTraining] || scenarios["Mensagem suspeita"];
  return list.find((item) => item.id === state.currentScenarioId) || list[0];
}

function render() {
  if (!screens[state.route]) {
    state.route = "home";
  }

  app.dataset.textSize = state.textSize;
  app.innerHTML = screens[state.route]();
}

function icon(name, extraClass = "") {
  return `<span class="material-symbols-rounded ${extraClass}" aria-hidden="true">${name}</span>`;
}

function topbar(title, options = {}) {
  const back = options.backRoute
    ? `<button class="icon-button" type="button" data-route="${options.backRoute}" aria-label="Voltar">${icon("arrow_back")}</button>`
    : "";

  const brand = options.brand
    ? `<span class="brand"><span class="brand-mark">${icon("shield")}</span>LiaSimplis</span>`
    : `<span class="topbar-title">${title}</span>`;

  return `
    <header class="topbar">
      ${back}
      ${brand}
      <button class="icon-button" type="button" data-action="speak" aria-label="Ouvir explicação">${icon("volume_up")}</button>
      <button class="icon-button" type="button" data-action="voice-command" aria-label="Comando por voz">${icon("mic")}</button>
      <button class="icon-button" type="button" data-action="toggle-text" aria-label="Alternar tamanho do texto">${icon("text_fields")}</button>
    </header>
  `;
}

function bottomNav(activeRoute = state.route) {
  const items = [
    ["home", "home", "Início"],
    ["trainings", "school", "Treinos"],
    ["deviceHelp", "build", "Ajuda"],
    ["dictionary", "menu_book", "Dicionário"],
    ["favorites", "star", "Salvos"],
  ];

  return `
    <nav class="bottom-nav" aria-label="Menu principal">
      ${items
        .map(
          ([route, iconName, label]) => `
            <button class="${activeRoute === route ? "is-active" : ""}" type="button" data-route="${route}">
              ${icon(iconName)}
              <span>${label}</span>
            </button>
          `,
        )
        .join("")}
    </nav>
  `;
}

function renderStart() {
  return `
    <article class="screen screen-start" data-screen="start">
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

        <section class="option-group compact-options" aria-label="Dispositivo">
          <h2 class="option-label">${icon("smartphone")}Seu celular</h2>
          <div class="chip-grid device-chip-grid">
            ${deviceBrands.map((brand) => deviceChoice(brand)).join("")}
          </div>
        </section>

        <section class="notice compact-notice" aria-label="Aviso de Segurança">
          <div class="notice-title"><span class="brand-mark">${icon("shield")}</span>Aviso de Segurança</div>
          <p class="body-copy"><strong>Nada real será enviado, pago ou alterado.</strong></p>
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="adjust">Começar ${icon("arrow_forward")}</button>
        </div>
      </div>
    </article>
  `;
}

function renderAdjust() {
  return `
    <article class="screen" data-screen="adjust">
      ${topbar("Acessibilidade", { backRoute: "start" })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">Como você prefere usar?</h1>
          <p class="subtitle">Texto, voz e leitura podem mudar depois.</p>
        </section>

        <section class="option-group" aria-label="Tamanho do texto">
          <h2 class="option-label">${icon("text_fields")}Tamanho do texto</h2>
          <div class="chip-grid">${textSizes.map((item) => choiceButton("textSize", item.value, item.label)).join("")}</div>
        </section>

        <section class="option-group" aria-label="Modo de explicação">
          <h2 class="option-label">${icon("record_voice_over")}Explicação</h2>
          <div class="chip-grid">${explanationModes.map((item) => choiceButton("explanationMode", item.value, item.label)).join("")}</div>
        </section>

        <section class="notice mini-notice">
          <div class="notice-title"><span class="brand-mark">${icon("mic")}</span>Comandos de voz</div>
          <p class="body-copy">Diga: início, treino, ajuda, dicionário ou salvos.</p>
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
  const percent = progressPercent();

  return `
    <article class="screen has-nav" data-screen="home">
      ${topbar("", { brand: true })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">${greeting}</h1>
          <p class="subtitle">${state.deviceBrand} · Como podemos ajudar hoje?</p>
        </section>

        <section class="progress-card">
          <div>
            <strong>Progresso</strong>
            <span>${state.progress.completed} testes feitos · ${state.progress.protectedChoices} escolhas seguras</span>
          </div>
          <div class="progress-track"><span style="width:${percent}%"></span></div>
        </section>

        ${continueCard()}

        <div class="home-grid">
          ${actionCard("trainings", "school", "Aprender e treinar", "Exercícios práticos")}
          ${actionCard("deviceHelp", "build", "Consertar celular", "Ajuda por marca")}
          ${actionCard("dictionary", "menu_book", "Tirar dúvida", "Termos simples")}
          ${actionCard("favorites", "star", "Salvos", "Favoritos")}
        </div>
      </div>
      ${bottomNav("home")}
    </article>
  `;
}

function renderTrainings() {
  return `
    <article class="screen has-nav" data-screen="trainings">
      ${topbar("Treinos", { backRoute: "home" })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">Escolha um treino</h1>
          <p class="subtitle">Mensagem suspeita tem 6 testes aleatórios.</p>
        </section>

        <div class="training-list">
          ${trainingButton("Mensagem suspeita")}
          ${trainingButton("Transferência instantânea")}
        </div>

        <section class="progress-card compact-progress">
          <div>
            <strong>Trilha atual</strong>
            <span>${state.progress.lastTraining}</span>
          </div>
          <div class="progress-track"><span style="width:${progressPercent()}%"></span></div>
        </section>

        <section class="notice mini-notice">
          <div class="notice-title"><span class="brand-mark">${icon("lock")}</span>Nada real será alterado.</div>
        </section>
      </div>
      ${bottomNav("trainings")}
    </article>
  `;
}

function renderTrainingStart() {
  const training = trainingDetails[state.selectedTraining];
  const total = scenarios[state.selectedTraining].length;

  return `
    <article class="screen has-nav" data-screen="trainingStart">
      ${topbar("Treino", { backRoute: "trainings" })}
      <div class="content">
        <section class="scenario-header">
          <span class="square-icon">${icon(training.icon)}</span>
          <div>
            <strong>${training.title}</strong>
            <p>${training.subtitle} · ${total} casos</p>
          </div>
        </section>

        <section class="safe-ribbon" aria-label="Aviso importante">
          <strong>Aviso importante</strong>
          <p class="body-copy">Isto é apenas um treino. Nenhuma mensagem, pagamento ou dado real será enviado.</p>
        </section>

        <section class="learn-list" aria-label="O que vamos aprender">
          <h2 class="option-label">${icon("checklist")}Você vai aprender</h2>
          <ol class="number-list">
            <li><span class="number">1</span><span>Identificar sinais de risco.</span></li>
            <li><span class="number">2</span><span>Escolher uma ação segura.</span></li>
            <li><span class="number">3</span><span>Entender o motivo da escolha.</span></li>
          </ol>
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-action="begin-simulation">${icon("shuffle")} Caso aleatório</button>
          <button class="button" type="button" data-route="trainings">Voltar</button>
        </div>
      </div>
      ${bottomNav("trainings")}
    </article>
  `;
}

function renderSimulation() {
  const item = currentScenario();

  return `
    <article class="screen has-nav" data-screen="simulation">
      ${topbar("Simulação", { backRoute: "trainingStart" })}
      <div class="content">
        <section class="screen-heading compact-heading">
          <h1 class="title">${item.title}</h1>
          <p class="subtitle">${item.sender} · caso fictício</p>
        </section>

        <section class="message-card" aria-label="Mensagem fictícia">
          <span class="fiction-badge">Fictício</span>
          <div class="message-header">
            <span class="square-icon">${icon("sms")}</span>
            <div>
              <div class="message-title">${item.sender}</div>
              <div class="message-time">Enviado agora</div>
            </div>
          </div>
          <p class="message-text">"${item.message}"</p>
          <span class="fake-link">${item.link}</span>
        </section>

        <section class="clue-card">
          <strong>Sinal de atenção</strong>
          <span>${item.clue}</span>
        </section>

        <section class="answer-panel" aria-label="Escolha uma resposta">
          <h2 class="option-label center">O que você faria?</h2>
          <button class="button button-primary" type="button" data-answer="safe">Não clicar / parar</button>
          <button class="button" type="button" data-answer="help">Pedir ajuda</button>
          <button class="button" type="button" data-answer="risky">Continuar</button>
        </section>
      </div>
      ${bottomNav("trainings")}
    </article>
  `;
}

function renderResult() {
  const result = resultCopy[state.selectedAnswer] || resultCopy.safe;
  const item = currentScenario();

  return `
    <article class="screen has-nav" data-screen="result">
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

        <section class="clue-card">
          <strong>Ação segura</strong>
          <span>${item.safeAction}</span>
        </section>

        <section class="screen-actions">
          <button class="button button-primary" type="button" data-action="another-scenario">${icon("shuffle")} Outro caso</button>
          <button class="button" type="button" data-action="open-link-term">${icon("link")} O que é link?</button>
          <button class="button button-dashed" type="button" data-route="home">${icon("home")} Início</button>
        </section>
      </div>
      ${bottomNav("trainings")}
    </article>
  `;
}

function renderDictionary() {
  const term = dictionaryTerms[state.activeTerm] || dictionaryTerms.link;
  const favorite = state.progress.favoriteTerms.includes(state.activeTerm);

  return `
    <article class="screen has-nav" data-screen="dictionary">
      ${topbar("Dicionário", { backRoute: "home" })}
      <div class="content">
        <section class="dictionary-tabs" aria-label="Termos">
          ${Object.entries(dictionaryTerms)
            .map(([key, item]) => termButton(key, item))
            .join("")}
        </section>

        <section class="dictionary-hero" aria-label="Dicionário Digital">
          <span class="round-icon">${icon(term.icon)}</span>
          <strong>${term.title}</strong>
          <button class="favorite-button ${favorite ? "is-favorite" : ""}" type="button" data-action="toggle-favorite">
            ${icon(favorite ? "star" : "star_border")} ${favorite ? "Salvo" : "Salvar"}
          </button>
        </section>

        <p class="dictionary-card">${term.short}</p>

        <p class="dictionary-tip"><span class="mini-icon">${icon("info")}</span><span>${term.example}</span></p>

        <section class="notice mini-notice">
          <div class="notice-title"><span class="brand-mark">${icon("warning")}</span>${term.alert}</div>
        </section>

        <div class="screen-actions dictionary-actions">
          <button class="button button-primary" type="button" data-route="conclusion">Entendi</button>
          <button class="button" type="button" data-action="speak">${icon("volume_up")} Ouvir</button>
        </div>
      </div>
      ${bottomNav("dictionary")}
    </article>
  `;
}

function renderConclusion() {
  return `
    <article class="screen has-nav" data-screen="conclusion">
      ${topbar("Conclusão", { backRoute: "dictionary" })}
      <div class="content">
        <section class="result-hero">
          <div class="result-ring">${icon("emoji_events")}</div>
          <h1 class="title">Você concluiu uma etapa</h1>
        </section>

        <section class="result-message">
          <strong>Você já praticou, revisou um termo e salvou o que achar importante.</strong>
          <span>Volte quando quiser para continuar de onde parou.</span>
        </section>

        <section class="progress-card">
          <div>
            <strong>Seu resumo</strong>
            <span>${state.progress.completed} testes · ${state.progress.favoriteTerms.length} favoritos</span>
          </div>
          <div class="progress-track"><span style="width:${progressPercent()}%"></span></div>
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="home">${icon("home")} Voltar ao início</button>
          <button class="button" type="button" data-route="trainings">${icon("school")} Fazer treino</button>
        </div>
      </div>
      ${bottomNav("home")}
    </article>
  `;
}

function renderDeviceHelp() {
  const item = deviceHelpDatabase[state.deviceProblem];
  const steps = item.steps[state.deviceBrand] || item.steps.Detectado;

  return `
    <article class="screen has-nav" data-screen="deviceHelp">
      ${topbar("Conserta Celular", { backRoute: "home" })}
      <div class="content">
        <section class="screen-heading compact-heading">
          <h1 class="title">Qual é o problema?</h1>
          <p class="subtitle">${state.deviceBrand} · banco local de ajuda</p>
        </section>

        <div class="device-list">
          ${Object.entries(deviceHelpDatabase)
            .map(([key, help]) => deviceProblemButton(key, help))
            .join("")}
        </div>

        <section class="step-panel" aria-label="Passo a passo">
          <h3>${item.title}</h3>
          <ol>
            ${steps.map((step) => `<li>${step}</li>`).join("")}
          </ol>
          <button class="button button-small" type="button" data-action="toggle-device-guide">
            ${icon("image")} ${state.showDeviceGuide ? "Ocultar print" : "Ver print"}
          </button>
        </section>

        ${state.showDeviceGuide ? deviceVisualGuide(item) : ""}
      </div>
      ${bottomNav("deviceHelp")}
    </article>
  `;
}

function renderFavorites() {
  const favorites = state.progress.favoriteTerms;

  return `
    <article class="screen has-nav" data-screen="favorites">
      ${topbar("Salvos", { backRoute: "home" })}
      <div class="content">
        <section class="screen-heading">
          <h1 class="title">Favoritos e continuar</h1>
          <p class="subtitle">Acesse rápido o que você salvou.</p>
        </section>

        ${continueCard()}

        <section class="favorite-list">
          <h2 class="option-label">${icon("star")}Termos salvos</h2>
          ${
            favorites.length
              ? favorites.map((key) => favoriteTermButton(key)).join("")
              : `<p class="empty-state">Nenhum termo salvo ainda.</p>`
          }
        </section>

        <div class="screen-actions">
          <button class="button button-primary" type="button" data-route="dictionary">${icon("menu_book")} Abrir dicionário</button>
        </div>
      </div>
      ${bottomNav("favorites")}
    </article>
  `;
}

function continueCard() {
  if (!state.progress.completed) {
    return `
      <section class="continue-card">
        <span class="square-icon">${icon("play_circle")}</span>
        <div>
          <strong>Comece seu primeiro treino</strong>
          <p>Pratique uma situação segura.</p>
        </div>
        <button class="button button-small" type="button" data-route="trainings">Abrir</button>
      </section>
    `;
  }

  return `
    <section class="continue-card">
      <span class="square-icon">${icon("history")}</span>
      <div>
        <strong>Continuar de onde parou</strong>
        <p>${state.progress.lastTraining}</p>
      </div>
      <button class="button button-small" type="button" data-action="continue-last">Continuar</button>
    </section>
  `;
}

function deviceChoice(brand) {
  const value = brand === "Detectado" ? detectedDevice : brand;
  const selected = state.deviceBrand === value;

  return `
    <button
      class="choice chip ${selected ? "is-selected" : ""}"
      type="button"
      data-device-brand="${value}"
    >
      ${brand === "Detectado" ? `Detectado: ${detectedDevice}` : brand}
    </button>
  `;
}

function choiceButton(field, value, label) {
  const isSelected = state[field] === value;

  return `
    <button
      class="choice chip ${isSelected ? "is-selected" : ""}"
      type="button"
      data-choice-field="${field}"
      data-choice-value="${value}"
    >
      ${label}
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

function termButton(key, item) {
  return `
    <button class="${state.activeTerm === key ? "is-active" : ""}" type="button" data-term="${key}">
      ${icon(item.icon)}
      <span>${item.title}</span>
    </button>
  `;
}

function favoriteTermButton(key) {
  const item = dictionaryTerms[key];
  return `
    <button class="favorite-item" type="button" data-term="${key}" data-route="dictionary">
      ${icon(item.icon)}
      <span>${item.title}</span>
      ${icon("arrow_forward_ios")}
    </button>
  `;
}

function deviceProblemButton(key, item) {
  const selected = state.deviceProblem === key;

  return `
    <button class="device-item ${selected ? "is-selected" : ""}" type="button" data-device-problem="${key}">
      <span class="square-icon">${icon(item.icon)}</span>
      <span>${item.title}</span>
    </button>
  `;
}

function deviceVisualGuide(item) {
  return `
    <section class="mock-phone-shot" aria-label="Print de exemplo">
      <div class="mock-phone-top"></div>
      <div class="mock-phone-line strong"></div>
      <div class="mock-phone-line"></div>
      <div class="mock-phone-highlight">${icon(item.icon)}</div>
      <p>${item.visual}</p>
    </section>
  `;
}

function bindEvents() {
  app.addEventListener("click", handleAppClick);
  app.addEventListener("input", handleAppInput);
}

function handleAppClick(event) {
  const answer = closestControl(event.target, "[data-answer]");
  if (answer) {
    event.preventDefault();
    selectAnswer(answer.dataset.answer);
    return;
  }

  const training = closestControl(event.target, "[data-training]");
  if (training) {
    event.preventDefault();
    startTraining(training.dataset.training);
    return;
  }

  const term = closestControl(event.target, "[data-term]");
  if (term) {
    event.preventDefault();
    state.activeTerm = term.dataset.term;
    persistState();

    if (term.dataset.route) {
      setRoute(term.dataset.route);
    } else {
      render();
    }
    return;
  }

  const deviceProblem = closestControl(event.target, "[data-device-problem]");
  if (deviceProblem) {
    event.preventDefault();
    state.deviceProblem = deviceProblem.dataset.deviceProblem;
    persistState();
    render();
    return;
  }

  const deviceBrand = closestControl(event.target, "[data-device-brand]");
  if (deviceBrand) {
    event.preventDefault();
    state.deviceBrand = deviceBrand.dataset.deviceBrand;
    persistState();
    render();
    return;
  }

  const choice = closestControl(event.target, "[data-choice-field]");
  if (choice) {
    event.preventDefault();
    state[choice.dataset.choiceField] = choice.dataset.choiceValue;
    persistState();
    render();
    return;
  }

  const action = closestControl(event.target, "[data-action]");
  if (action) {
    event.preventDefault();
    handleAction(action.dataset.action);
    return;
  }

  const route = closestControl(event.target, "[data-route]");
  if (route) {
    event.preventDefault();
    setRoute(route.dataset.route);
  }
}

function handleAppInput(event) {
  const field = closestControl(event.target, "[data-field='name']");

  if (field) {
    state.name = field.value;
    persistState();
  }
}

function closestControl(target, selector) {
  const start = target instanceof Element ? target : target.parentElement;
  const element = start?.closest(selector);
  return element && app.contains(element) ? element : null;
}

function selectAnswer(answer) {
  state.selectedAnswer = answer;
  state.progress.completed += 1;

  if (["safe", "help"].includes(state.selectedAnswer)) {
    state.progress.protectedChoices += 1;
  }

  persistState();
  setRoute("result");
}

function handleAction(action) {
  if (action === "toggle-text") {
    const currentIndex = textSizes.findIndex((item) => item.value === state.textSize);
    const next = textSizes[(currentIndex + 1) % textSizes.length];
    state.textSize = next.value;
    persistState();
    render();
    return;
  }

  if (action === "speak") {
    speakScreen();
    return;
  }

  if (action === "voice-command") {
    startVoiceCommand();
    return;
  }

  if (action === "begin-simulation" || action === "another-scenario") {
    state.currentScenarioId = pickRandomScenario().id;
    persistState();
    setRoute("simulation");
    return;
  }

  if (action === "open-link-term") {
    state.activeTerm = "link";
    setRoute("dictionary");
    return;
  }

  if (action === "toggle-favorite") {
    toggleFavoriteTerm(state.activeTerm);
    render();
    return;
  }

  if (action === "toggle-device-guide") {
    state.showDeviceGuide = !state.showDeviceGuide;
    persistState();
    render();
    return;
  }

  if (action === "continue-last") {
    startTraining(state.progress.lastTraining || "Mensagem suspeita");
  }
}

function speakScreen() {
  if (!("speechSynthesis" in window)) {
    showToast("Este navegador não tem leitura em voz alta disponível.");
    return;
  }

  const text = speechTextForCurrentScreen();
  const voice = choosePortugueseVoice();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.86;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

function speechTextForCurrentScreen() {
  const route = state.route;

  if (route === "dictionary") {
    const term = dictionaryTerms[state.activeTerm] || dictionaryTerms.link;
    return `${term.title}. ${term.short} ${term.example} Atenção: ${term.alert}`;
  }

  if (route === "simulation") {
    const item = currentScenario();
    return `Simulação. ${item.title}. Mensagem: ${item.message}. Sinal de atenção: ${item.clue}. O que você faria?`;
  }

  if (route === "result") {
    const result = resultCopy[state.selectedAnswer] || resultCopy.safe;
    const item = currentScenario();
    return `${result.title}. ${result.message} ${result.detail} Ação segura: ${item.safeAction}`;
  }

  if (route === "deviceHelp") {
    const item = deviceHelpDatabase[state.deviceProblem];
    const steps = item.steps[state.deviceBrand] || item.steps.Detectado;
    return `${item.title}. ${steps.join(". ")}.`;
  }

  return app.innerText
    .replace(/\s+/g, " ")
    .replace(/Início|Treinos|Ajuda|Dicionário|Salvos/g, "")
    .trim()
    .slice(0, 520);
}

function choosePortugueseVoice() {
  const voices = availableVoices.length
    ? availableVoices
    : window.speechSynthesis.getVoices();

  const preferred = [
    "google português do brasil",
    "google portuguese",
    "microsoft francisca",
    "microsoft maria",
    "microsoft daniel",
    "luciana",
    "português do brasil",
    "portuguese brazil",
  ];

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === "pt-br" && preferred.some((name) => voice.name.toLowerCase().includes(name))) ||
    voices.find((voice) => voice.lang?.toLowerCase() === "pt-br") ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("pt")) ||
    null
  );
}

function startVoiceCommand() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    showToast("Comando de voz não está disponível neste navegador.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => showToast("Ouvindo: diga início, treino, ajuda, dicionário ou salvos.");
  recognition.onerror = () => showToast("Não consegui ouvir. Tente tocar no botão novamente.");
  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript.toLowerCase();
    const route = routeFromSpeech(spoken);

    if (route) {
      setRoute(route);
    } else {
      showToast(`Não reconheci: "${spoken}".`);
    }
  };

  recognition.start();
}

function routeFromSpeech(text) {
  if (text.includes("início") || text.includes("inicio")) return "home";
  if (text.includes("treino") || text.includes("aprender")) return "trainings";
  if (text.includes("ajuda") || text.includes("celular")) return "deviceHelp";
  if (text.includes("dicion")) return "dictionary";
  if (text.includes("salvo") || text.includes("favorito")) return "favorites";
  return "";
}

function toggleFavoriteTerm(key) {
  const favorites = new Set(state.progress.favoriteTerms);

  if (favorites.has(key)) {
    favorites.delete(key);
  } else {
    favorites.add(key);
  }

  state.progress.favoriteTerms = [...favorites];
  persistState();
}

function progressPercent() {
  return Math.min(100, Math.round((state.progress.completed / 6) * 100));
}

function detectDeviceBrand() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad")) return "iPhone";
  if (ua.includes("samsung")) return "Samsung";
  if (ua.includes("moto")) return "Motorola";
  if (ua.includes("xiaomi") || ua.includes("redmi")) return "Xiaomi";
  return "Detectado";
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

bindEvents();
render();
