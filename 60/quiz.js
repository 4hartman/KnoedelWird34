(function () {
  'use strict';

  var state = {
    config: null,
    questionIndex: 0,
    scores: {},
    phase: 'loading'
  };

  var app = document.getElementById('app');
  var bg = document.getElementById('bg');
  var voteBar = document.getElementById('vote-bar');

  function init() {
    createParticles();
    fetch('questions.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (config) {
        state.config = config;
        resetScores();
        applyVoteBarSetting();
        renderIntro();
      })
      .catch(function (err) {
        console.error('Failed to load questions.json', err);
        showLoadError();
      });
  }

  function resetScores() {
    state.scores = {};
    var keys = Object.keys(state.config.destinations);
    for (var i = 0; i < keys.length; i++) {
      state.scores[keys[i]] = 0;
    }
    state.questionIndex = 0;
    state.phase = 'intro';
  }

  function applyVoteBarSetting() {
    if (!voteBar) return;
    var enabled = state.config.meta && state.config.meta.voteBarEnabled === true;
    voteBar.hidden = !enabled;
  }

  function showLoadError() {
    app.innerHTML =
      '<div class="card slide-in">' +
        '<div class="question">Hoppla — die Fragen-Datei konnte nicht geladen werden.</div>' +
        '<div class="hint">Pruefe, ob <code>questions.json</code> neben dieser Seite liegt und gueltiges JSON ist.</div>' +
      '</div>';
  }

  function slideTransition(buildFn) {
    var old = app.querySelector('.card');
    if (!old) {
      app.innerHTML = '';
      app.appendChild(buildFn());
      return;
    }
    old.classList.remove('slide-in');
    old.classList.add('slide-out');
    setTimeout(function () {
      app.innerHTML = '';
      app.appendChild(buildFn());
    }, 300);
  }

  function el(tag, opts) {
    var node = document.createElement(tag);
    if (!opts) return node;
    if (opts.cls) node.className = opts.cls;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) {
      var keys = Object.keys(opts.attrs);
      for (var i = 0; i < keys.length; i++) {
        node.setAttribute(keys[i], opts.attrs[keys[i]]);
      }
    }
    if (opts.on) {
      var events = Object.keys(opts.on);
      for (var j = 0; j < events.length; j++) {
        node.addEventListener(events[j], opts.on[events[j]]);
      }
    }
    if (opts.children) {
      for (var k = 0; k < opts.children.length; k++) {
        if (opts.children[k]) node.appendChild(opts.children[k]);
      }
    }
    return node;
  }

  function interpolate(template, vars) {
    if (!template) return '';
    return template.replace(/\{(\w+)\}/g, function (_, key) {
      return vars[key] != null ? vars[key] : '{' + key + '}';
    });
  }

  // ─── Rendering ──────────────────────────────────────────

  function renderIntro() {
    state.phase = 'intro';
    bg.className = 'bg';
    var intro = state.config.intro || {};
    var recipient = (state.config.meta && state.config.meta.recipient) || '';
    var greeting = interpolate(intro.greeting || 'Willkommen!', { recipient: recipient });
    var occasion = (state.config.meta && state.config.meta.occasion) || '';

    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in',
        children: [
          el('div', { cls: 'intro-badge', text: '60' }),
          occasion ? el('div', { cls: 'intro-occasion', text: occasion }) : null,
          el('div', { cls: 'intro-greeting', text: greeting }),
          intro.subtitle ? el('div', { cls: 'intro-subtitle', text: intro.subtitle }) : null,
          el('div', {
            cls: 'buttons compact',
            children: [
              el('button', {
                cls: 'btn',
                text: intro.buttonText || "Los geht's",
                on: { click: function () { startQuestions(); } }
              })
            ]
          })
        ]
      });
    });
  }

  function startQuestions() {
    state.questionIndex = 0;
    renderQuestion();
  }

  function renderQuestion() {
    state.phase = 'question';
    var questions = state.config.questions;
    if (state.questionIndex >= questions.length) {
      finishQuiz();
      return;
    }
    var q = questions[state.questionIndex];
    var total = questions.length;
    var stepNum = state.questionIndex + 1;
    var pct = Math.round((stepNum / total) * 100);

    slideTransition(function () {
      return buildQuestionCard(q, {
        progressPct: pct,
        stepLabel: 'Frage ' + stepNum + ' von ' + total,
        onAnswer: function (option) { handleAnswer(q, option); }
      });
    });
  }

  function buildQuestionCard(q, opts) {
    var children = [];

    children.push(el('div', {
      cls: 'progress',
      children: [
        el('div', { cls: 'progress-bar', attrs: { style: 'width:' + opts.progressPct + '%' } })
      ]
    }));

    children.push(el('h2', { text: opts.stepLabel }));
    children.push(el('div', { cls: 'question', text: q.question }));

    if (q.hint) {
      children.push(el('div', { cls: 'hint', text: q.hint }));
    }

    var buttonNodes = q.options.map(function (option) {
      return buildOptionButton(q, option, opts.onAnswer);
    });

    var allImages = q.options.every(function (o) { return !!o.image; });
    var layoutCls;
    if (allImages) {
      layoutCls = ' image-grid';
    } else {
      var compact = q.options.every(function (o) { return !o.image && (o.text || '').length <= 22; });
      layoutCls = compact ? ' compact' : '';
    }
    children.push(el('div', {
      cls: 'buttons' + layoutCls,
      children: buttonNodes
    }));

    return el('div', { cls: 'card slide-in', children: children });
  }

  function buildOptionButton(question, option, onAnswer) {
    var commonAttrs = {
      'data-question-id': question.id,
      'data-option-id': option.id
    };
    var clickHandler = { click: function () { onAnswer(option); } };

    if (option.image) {
      var children = [
        el('img', {
          cls: 'btn__image',
          attrs: { src: option.image, alt: option.alt || option.text || '' }
        })
      ];
      if (option.text) {
        children.push(el('span', { cls: 'btn__caption', text: option.text }));
      }
      return el('button', {
        cls: 'btn btn--image',
        attrs: commonAttrs,
        on: clickHandler,
        children: children
      });
    }

    return el('button', {
      cls: 'btn',
      text: option.text,
      attrs: commonAttrs,
      on: clickHandler
    });
  }

  function handleAnswer(question, option) {
    addPoints(option.points);
    state.questionIndex += 1;
    renderQuestion();
  }

  function addPoints(points) {
    if (!points) return;
    var keys = Object.keys(points);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (state.scores[key] == null) state.scores[key] = 0;
      state.scores[key] += points[key];
    }
  }

  function finishQuiz() {
    var winner = computeWinner();
    if (winner == null) {
      renderTiebreaker();
      return;
    }
    showReveal(winner);
  }

  function computeWinner() {
    var keys = Object.keys(state.scores);
    if (keys.length === 0) return null;
    var maxScore = -Infinity;
    var leaders = [];
    for (var i = 0; i < keys.length; i++) {
      var s = state.scores[keys[i]];
      if (s > maxScore) {
        maxScore = s;
        leaders = [keys[i]];
      } else if (s === maxScore) {
        leaders.push(keys[i]);
      }
    }
    if (leaders.length === 1) return leaders[0];
    return null;
  }

  function renderTiebreaker() {
    state.phase = 'tiebreaker';
    var tb = state.config.tiebreaker;
    if (!tb) {
      console.warn('Tie detected but no tiebreaker configured. Falling back to first destination.');
      showReveal(Object.keys(state.config.destinations)[0]);
      return;
    }

    slideTransition(function () {
      return buildQuestionCard(tb, {
        progressPct: 100,
        stepLabel: 'Stichfrage',
        onAnswer: function (option) { showReveal(option.winner); }
      });
    });
  }

  // ─── Reveal ─────────────────────────────────────────────

  function showReveal(destinationKey) {
    state.phase = 'drumroll';
    showDrumroll(function () { renderRevealCard(destinationKey); });
  }

  function showDrumroll(then) {
    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in',
        children: [
          el('span', { cls: 'drumroll-emoji', text: '🎁' }),
          el('div', {
            cls: 'drumroll-text',
            html: 'Trommelwirbel<span class="drumroll-dots"></span>'
          })
        ]
      });
    });
    setTimeout(then, 2800);
  }

  function renderRevealCard(destinationKey) {
    state.phase = 'reveal';
    var dest = state.config.destinations[destinationKey];
    if (!dest) {
      console.error('Unknown destination key:', destinationKey);
      return;
    }
    bg.className = 'bg';
    if (dest.bgClass) bg.classList.add(dest.bgClass);
    launchConfetti();

    slideTransition(function () {
      return el('div', {
        cls: 'card reveal-card slide-in',
        children: [
          dest.emoji ? el('span', { cls: 'emoji-big', text: dest.emoji }) : null,
          dest.title ? el('div', { cls: 'reveal-title', text: dest.title }) : null,
          el('div', { cls: 'reveal-destination', text: dest.label }),
          dest.tagline ? el('div', { cls: 'reveal-tagline', text: dest.tagline }) : null,
          dest.details ? el('div', { cls: 'reveal-details', text: dest.details }) : null,
          el('div', {
            cls: 'buttons',
            children: [
              el('button', {
                cls: 'btn',
                text: 'Nochmal spielen',
                on: { click: function () { restart(); } }
              })
            ]
          })
        ]
      });
    });
  }

  function restart() {
    bg.className = 'bg';
    resetScores();
    applyVoteBarSetting();
    renderIntro();
  }

  // ─── Effects ────────────────────────────────────────────

  function launchConfetti() {
    var c = document.getElementById('confetti');
    if (!c) return;
    c.innerHTML = '';
    var cols = ['#b18540', '#e8c074', '#d97448', '#2e8bc0', '#c8102e', '#f4e9d8', '#0a4d8c'];
    for (var i = 0; i < 120; i++) {
      var p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[Math.floor(Math.random() * cols.length)];
      p.style.width = (Math.random() * 8 + 6) + 'px';
      p.style.height = (Math.random() * 8 + 6) + 'px';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.animationDuration = (Math.random() * 2 + 2) + 's';
      p.style.animationDelay = (Math.random() * 1.5) + 's';
      c.appendChild(p);
    }
    setTimeout(function () { c.innerHTML = ''; }, 5000);
  }

  function createParticles() {
    var c = document.getElementById('particles');
    if (!c) return;
    c.innerHTML = '';
    for (var i = 0; i < 26; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = (Math.random() * 4 + 3);
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (Math.random() * 8 + 6) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      c.appendChild(p);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
