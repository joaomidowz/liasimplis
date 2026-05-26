# Lia Simplis - Prototipo HTML

Prototipo navegavel em HTML, CSS e JavaScript puro para validar o fluxo inicial do Lia Simplis sem backend, banco de dados ou integracoes reais.

## Como abrir

Abra `index.html` no navegador.

Opcionalmente, rode um servidor estatico local:

```bash
python3 -m http.server 4173
```

Depois acesse `http://localhost:4173` a partir desta pasta.

## Escopo atual

- Tela inicial com nome e aviso de seguranca.
- Ajuste rapido de tamanho de texto e modo de explicacao.
- Home com quatro acoes principais.
- Lista de treinos.
- Inicio da simulacao.
- Simulacao de mensagem suspeita.
- Resultado da decisao.
- Dicionario digital para o termo "link".
- Tela Conserta Celular.
- Frame visual fixo de celular em `390x844px`, sem rolagem por tela.
- Icones por Google Material Symbols.

## Checklist de requisitos

A lista para marcar requisitos importantes está em `docs/requisitos-funcionais-checklist.md`.

## Onde ajustar cores depois

As cores ficam centralizadas em `styles.css`, no bloco `:root`.

Tokens principais:

- `--color-base`
- `--color-page`
- `--color-surface`
- `--color-secondary`
- `--color-text`
- `--color-primary`
- `--color-primary-strong`

Quando a paleta final chegar, trocar primeiro esses tokens antes de mexer nos componentes.

## Paleta atual

- Base 60%: `#FAFAFA`
- Azul apoio/acao: `#8080FF`
- Secundaria/confirmacao: `#005451`
