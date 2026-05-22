(function () {
  'use strict';

  var ROLE_KEY = '60_role';
  var VOTE_LOCK_PREFIX = '60_voted_';
  var DRUMROLL_MS = 2800;

  var state = {
    config: null,
    role: null,

    questionIndex: 0,
    scores: {},
    phase: 'loading',
    currentGameId: null,
    playerHistory: [],

    viewerLastQid: null,
    viewerLastPhase: null,

    unsubState: null,
    unsubVotes: null,
    currentVoteQid: null
  };

  var app, bg, voteBar, voteSidePanel;

  // ─── Init ───────────────────────────────────────────────

  function boot() {
    app = document.getElementById('app');
    bg = document.getElementById('bg');
    voteBar = document.getElementById('vote-bar');
    voteSidePanel = document.getElementById('vote-side-panel');
    createParticles();
    loadConfig()
      .then(bootstrapRole)
      .catch(function (err) {
        console.error('Boot failed', err);
        showLoadError();
      });
  }

  function loadConfig() {
    return fetch('questions.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (config) {
        state.config = config;
      });
  }

  function showLoadError() {
    app.innerHTML =
      '<div class="card slide-in">' +
        '<div class="question">Hoppla — die Fragen-Datei konnte nicht geladen werden.</div>' +
        '<div class="hint">Pruefe, ob <code>questions.json</code> neben dieser Seite liegt und gueltiges JSON ist.</div>' +
      '</div>';
  }

  // ─── Role bootstrap ─────────────────────────────────────

  function bootstrapRole() {
    var url = new URL(window.location.href);
    var fromUrl = url.searchParams.get('role');
    var fromStorage = null;
    try { fromStorage = localStorage.getItem(ROLE_KEY); } catch (_) {}
    var role = normalizeRole(fromUrl) || normalizeRole(fromStorage);
    if (role) {
      activateRole(role);
    } else {
      renderRolePrompt();
    }
  }

  function normalizeRole(value) {
    if (value === 'player' || value === 'viewer') return value;
    return null;
  }

  function activateRole(role) {
    teardownSubscriptions();
    state.role = role;
    try { localStorage.setItem(ROLE_KEY, role); } catch (_) {}
    var url = new URL(window.location.href);
    if (url.searchParams.get('role') !== role) {
      url.searchParams.set('role', role);
      history.replaceState(null, '', url.toString());
    }

    if (window.Realtime) {
      window.Realtime.init().then(function () {
        if (role === 'player') startPlayer();
        else startViewer();
      });
    } else {
      if (role === 'player') startPlayer();
      else startViewer();
    }
  }

  function teardownSubscriptions() {
    if (state.unsubState) { state.unsubState(); state.unsubState = null; }
    if (state.unsubVotes) { state.unsubVotes(); state.unsubVotes = null; }
    state.viewerLastQid = null;
    state.viewerLastPhase = null;
    state.currentVoteQid = null;
  }

  function clearRole() {
    teardownSubscriptions();
    state.role = null;
    try { localStorage.removeItem(ROLE_KEY); } catch (_) {}
    var url = new URL(window.location.href);
    url.searchParams.delete('role');
    history.replaceState(null, '', url.toString());
  }

  function renderRolePrompt() {
    bg.className = 'bg';
    hideVoteBar();
    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in role-prompt',
        children: [
          el('div', { cls: 'intro-badge', text: '60' }),
          el('div', { cls: 'intro-occasion', text: 'Live-Voting bereit' }),
          el('div', { cls: 'intro-greeting', text: 'Wer bist du?' }),
          el('div', { cls: 'intro-subtitle', text: 'Spiele das Quiz selbst — oder stimme als Gast live mit.' }),
          el('div', {
            cls: 'buttons',
            children: [
              el('button', {
                cls: 'btn role-prompt__btn role-prompt__btn--player',
                children: [
                  el('span', { cls: 'role-prompt__icon', text: '🎁' }),
                  el('span', { cls: 'role-prompt__label', text: 'Spieler*in' }),
                  el('span', { cls: 'role-prompt__hint', text: 'Quiz starten' })
                ],
                on: { click: function () { activateRole('player'); } }
              }),
              el('button', {
                cls: 'btn role-prompt__btn role-prompt__btn--viewer',
                children: [
                  el('span', { cls: 'role-prompt__icon', text: '📊' }),
                  el('span', { cls: 'role-prompt__label', text: 'Gast' }),
                  el('span', { cls: 'role-prompt__hint', text: 'Live mitvoten' })
                ],
                on: { click: function () { activateRole('viewer'); } }
              })
            ]
          })
        ]
      });
    });
  }

  // ─── Player mode ────────────────────────────────────────

  function startPlayer() {
    resetScores();
    state.phase = 'intro';
    renderIntro();
  }

  function resetScores() {
    state.scores = {};
    var keys = Object.keys(state.config.destinations);
    for (var i = 0; i < keys.length; i++) state.scores[keys[i]] = 0;
    state.questionIndex = 0;
    state.playerHistory = [];
  }

  function renderIntro() {
    state.phase = 'intro';
    bg.className = 'bg';
    hideVoteBar();
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
          }),
          buildSwitchRoleLink()
        ]
      });
    });
  }

  function buildSwitchRoleLink() {
    return el('div', {
      cls: 'role-switch',
      children: [
        el('button', {
          cls: 'role-switch__btn',
          text: 'Rolle wechseln',
          on: { click: function () { clearRole(); renderRolePrompt(); } }
        })
      ]
    });
  }

  function startQuestions() {
    var doStart = function (gameId) {
      state.currentGameId = gameId;
      state.questionIndex = 0;
      renderQuestion();
    };
    if (window.Realtime && window.Realtime.isReady()) {
      window.Realtime.resetSession().then(doStart);
    } else {
      doStart(String(Date.now()));
    }
  }

  function renderQuestion() {
    state.phase = 'question';
    var questions = state.config.questions;
    if (state.questionIndex >= questions.length) { finishQuiz(); return; }

    var q = questions[state.questionIndex];
    var total = questions.length;
    var stepNum = state.questionIndex + 1;
    var pct = Math.round((stepNum / total) * 100);

    publishState({ phase: 'question', questionId: q.id, revealKey: null });
    switchVoteSubscription(q.id);

    slideTransition(function () {
      return buildQuestionCard(q, {
        progressPct: pct,
        stepLabel: 'Frage ' + stepNum + ' von ' + total,
        mode: 'player',
        showBack: state.playerHistory.length > 0,
        onBack: handlePlayerBack,
        onAnswer: function (option) { handlePlayerAnswer(q, option); }
      });
    });
  }

  function handlePlayerAnswer(question, option) {
    state.playerHistory.push({
      questionId: question.id,
      optionId: option.id,
      points: option.points || {},
      wasTiebreaker: false
    });
    addPoints(option.points);
    state.questionIndex += 1;
    renderQuestion();
  }

  function handlePlayerBack() {
    if (state.playerHistory.length === 0) return;
    var last = state.playerHistory.pop();
    subtractPoints(last.points);
    if (last.wasTiebreaker) {
      renderTiebreakerPlayer();
    } else {
      state.questionIndex = Math.max(0, state.questionIndex - 1);
      renderQuestion();
    }
  }

  function subtractPoints(points) {
    if (!points) return;
    var keys = Object.keys(points);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (state.scores[key] == null) state.scores[key] = 0;
      state.scores[key] -= points[key];
    }
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
    if (winner == null) { renderTiebreakerPlayer(); return; }
    playerRevealSequence(winner);
  }

  function computeWinner() {
    var keys = Object.keys(state.scores);
    if (!keys.length) return null;
    var maxScore = -Infinity;
    var leaders = [];
    for (var i = 0; i < keys.length; i++) {
      var s = state.scores[keys[i]];
      if (s > maxScore) { maxScore = s; leaders = [keys[i]]; }
      else if (s === maxScore) { leaders.push(keys[i]); }
    }
    return leaders.length === 1 ? leaders[0] : null;
  }

  function renderTiebreakerPlayer() {
    state.phase = 'tiebreaker';
    var tb = state.config.tiebreaker;
    if (!tb) {
      console.warn('Tie detected but no tiebreaker configured.');
      playerRevealSequence(Object.keys(state.config.destinations)[0]);
      return;
    }

    publishState({ phase: 'tiebreaker', questionId: tb.id, revealKey: null });
    switchVoteSubscription(tb.id);

    slideTransition(function () {
      return buildQuestionCard(tb, {
        progressPct: 100,
        stepLabel: 'Stichfrage',
        mode: 'player',
        showBack: state.playerHistory.length > 0,
        onBack: handlePlayerBack,
        onAnswer: function (option) {
          state.playerHistory.push({
            questionId: tb.id,
            optionId: option.id,
            points: {},
            wasTiebreaker: true
          });
          playerRevealSequence(option.winner);
        }
      });
    });
  }

  function playerRevealSequence(destinationKey) {
    state.phase = 'reveal';
    publishState({ phase: 'reveal', questionId: null, revealKey: destinationKey });
    switchVoteSubscription(null);
    showDrumroll(function () { renderRevealCard(destinationKey); });
  }

  function publishState(partial) {
    if (state.role !== 'player') return;
    if (!window.Realtime || !window.Realtime.isReady()) return;
    var payload = Object.assign({}, partial);
    if (state.currentGameId && payload.gameId == null) payload.gameId = state.currentGameId;
    window.Realtime.setState(payload);
  }

  // ─── Viewer mode ────────────────────────────────────────

  function startViewer() {
    if (!window.Realtime || !window.Realtime.isReady()) {
      renderViewerOfflineCard();
      return;
    }
    state.viewerLastQid = null;
    state.viewerLastPhase = null;
    state.unsubState = window.Realtime.onState(applyRemoteState);
  }

  function applyRemoteState(remote) {
    if (!remote || !remote.phase || remote.phase === 'intro') {
      if (state.viewerLastPhase !== 'standby') {
        renderViewerStandby();
        switchVoteSubscription(null);
        state.viewerLastPhase = 'standby';
        state.viewerLastQid = null;
      }
      return;
    }

    if (remote.phase === 'question' || remote.phase === 'tiebreaker') {
      var qid = remote.questionId;
      if (state.viewerLastQid !== qid || state.viewerLastPhase !== remote.phase) {
        renderViewerQuestion(qid, remote.phase === 'tiebreaker', remote.gameId);
        switchVoteSubscription(qid);
        state.viewerLastQid = qid;
        state.viewerLastPhase = remote.phase;
      }
      return;
    }

    if (remote.phase === 'reveal') {
      if (state.viewerLastPhase !== 'reveal') {
        viewerRevealSequence(remote.revealKey);
        switchVoteSubscription(null);
        state.viewerLastPhase = 'reveal';
        state.viewerLastQid = null;
      }
    }
  }

  function renderViewerStandby() {
    bg.className = 'bg';
    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in',
        children: [
          el('div', { cls: 'intro-badge', text: '🎉' }),
          el('div', { cls: 'intro-occasion', text: 'Live-Voting' }),
          el('div', { cls: 'intro-greeting', text: 'Gleich geht\'s los!' }),
          el('div', { cls: 'intro-subtitle', text: 'Sobald das Quiz startet, kannst du hier live mit abstimmen.' }),
          buildSwitchRoleLink()
        ]
      });
    });
  }

  function renderViewerOfflineCard() {
    bg.className = 'bg';
    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in',
        children: [
          el('div', { cls: 'intro-badge', text: '⚡' }),
          el('div', { cls: 'intro-greeting', text: 'Live-Voting nicht verfuegbar' }),
          el('div', { cls: 'intro-subtitle', text: 'Die Live-Verbindung konnte nicht aufgebaut werden. Wende dich bitte an den/die Gastgeber*in.' }),
          buildSwitchRoleLink()
        ]
      });
    });
  }

  function renderViewerQuestion(qid, isTiebreaker, gameId) {
    var q = findQuestion(qid);
    if (!q) { console.warn('Viewer: unknown question', qid); return; }

    var voteKey = VOTE_LOCK_PREFIX + (gameId || '0') + '_' + qid;
    var chosenOptionId = null;
    try { chosenOptionId = localStorage.getItem(voteKey); } catch (_) {}

    var stepLabel;
    if (isTiebreaker) {
      stepLabel = 'Stichfrage';
    } else {
      var idx = indexOfQuestion(qid);
      var total = state.config.questions.length;
      stepLabel = idx >= 0 ? 'Frage ' + (idx + 1) + ' von ' + total : 'Frage';
    }
    var pct = isTiebreaker ? 100 : Math.round(((indexOfQuestion(qid) + 1) / state.config.questions.length) * 100);

    bg.className = 'bg';
    slideTransition(function () {
      return buildQuestionCard(q, {
        progressPct: pct,
        stepLabel: stepLabel,
        mode: 'viewer',
        votedOptionId: chosenOptionId,
        onAnswer: function (option) {
          if (chosenOptionId === option.id) return;
          if (!window.Realtime) return;
          var previous = chosenOptionId;
          try { localStorage.setItem(voteKey, option.id); } catch (_) {}
          renderViewerQuestion(qid, isTiebreaker, gameId);
          window.Realtime.castVote(qid, option.id, previous).then(function (ok) {
            if (ok) return;
            try {
              if (previous) localStorage.setItem(voteKey, previous);
              else localStorage.removeItem(voteKey);
            } catch (_) {}
            renderViewerQuestion(qid, isTiebreaker, gameId);
          });
        }
      });
    });
  }

  function viewerRevealSequence(destinationKey) {
    if (!destinationKey || !state.config.destinations[destinationKey]) return;
    showDrumroll(function () { renderRevealCard(destinationKey); });
  }

  // ─── Shared rendering ───────────────────────────────────

  function buildQuestionCard(q, opts) {
    var children = [];
    children.push(el('div', {
      cls: 'progress',
      children: [el('div', { cls: 'progress-bar', attrs: { style: 'width:' + opts.progressPct + '%' } })]
    }));

    if (opts.showBack && opts.onBack) {
      children.push(el('button', {
        cls: 'back-btn',
        text: '←',
        attrs: { 'aria-label': 'Zurueck zur vorherigen Frage', 'title': 'Zurueck' },
        on: { click: opts.onBack }
      }));
    }

    children.push(el('h2', { text: opts.stepLabel }));
    children.push(el('div', { cls: 'question', text: q.question }));
    if (q.hint) children.push(el('div', { cls: 'hint', text: q.hint }));

    var votedId = opts.votedOptionId || null;

    var buttonNodes = q.options.map(function (option) {
      return buildOptionButton(q, option, opts.onAnswer, {
        mode: opts.mode,
        voted: votedId === option.id
      });
    });

    var allImages = q.options.every(function (o) { return !!o.image; });
    var layoutCls;
    if (allImages) {
      layoutCls = ' image-grid';
    } else {
      var compact = q.options.every(function (o) { return !o.image && (o.text || '').length <= 22; });
      layoutCls = compact ? ' compact' : '';
    }
    children.push(el('div', { cls: 'buttons' + layoutCls, children: buttonNodes }));

    if (opts.mode === 'viewer') {
      children.push(el('div', {
        cls: 'viewer-note',
        text: votedId
          ? 'Du kannst deine Stimme aendern, solange diese Frage laeuft.'
          : 'Du bist Gast — waehle deine Stimme.'
      }));
    }

    children.push(buildSwitchRoleLink());

    return el('div', { cls: 'card slide-in', children: children });
  }

  function buildOptionButton(question, option, onAnswer, ctx) {
    ctx = ctx || {};
    var commonAttrs = {
      'data-question-id': question.id,
      'data-option-id': option.id
    };
    var cls = 'btn';
    if (option.image) cls += ' btn--image';
    if (ctx.voted) cls += ' btn--voted';

    var clickHandler = { click: function () { onAnswer(option); } };

    if (option.image) {
      var children = [
        el('img', {
          cls: 'btn__image',
          attrs: { src: option.image, alt: option.alt || option.text || '' }
        })
      ];
      if (option.text) children.push(el('span', { cls: 'btn__caption', text: option.text }));
      if (ctx.voted) children.push(el('span', { cls: 'btn__voted-flag', text: 'Deine Stimme' }));
      return el('button', {
        cls: cls,
        attrs: commonAttrs,
        on: clickHandler,
        children: children
      });
    }

    var textChildren = [el('span', { text: option.text })];
    if (ctx.voted) textChildren.push(el('span', { cls: 'btn__voted-flag', text: 'Deine Stimme' }));
    return el('button', {
      cls: cls,
      attrs: commonAttrs,
      on: clickHandler,
      children: textChildren
    });
  }

  function renderRevealCard(destinationKey) {
    state.phase = 'reveal';
    var dest = state.config.destinations[destinationKey];
    if (!dest) { console.error('Unknown destination key:', destinationKey); return; }

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
          state.role === 'player'
            ? el('div', {
                cls: 'buttons',
                children: [
                  el('button', {
                    cls: 'btn',
                    text: 'Nochmal spielen',
                    on: { click: function () { playerRestart(); } }
                  })
                ]
              })
            : null
        ]
      });
    });
  }

  function playerRestart() {
    bg.className = 'bg';
    var afterReset = function () {
      resetScores();
      renderIntro();
    };
    if (window.Realtime && window.Realtime.isReady()) {
      window.Realtime.resetSession().then(function (gameId) {
        state.currentGameId = gameId;
        afterReset();
      });
    } else {
      afterReset();
    }
  }

  function showDrumroll(then) {
    slideTransition(function () {
      return el('div', {
        cls: 'card slide-in',
        children: [
          el('span', { cls: 'drumroll-emoji', text: '🎁' }),
          el('div', { cls: 'drumroll-text', html: 'Trommelwirbel<span class="drumroll-dots"></span>' })
        ]
      });
    });
    setTimeout(then, DRUMROLL_MS);
  }

  // ─── Vote bar ───────────────────────────────────────────

  function switchVoteSubscription(qid) {
    if (state.unsubVotes) { state.unsubVotes(); state.unsubVotes = null; }
    state.currentVoteQid = qid;
    if (!qid) { hideVoteDisplays(); return; }
    var enabled = state.config.meta && state.config.meta.voteBarEnabled === true;
    if (!enabled || !window.Realtime || !window.Realtime.isReady()) { hideVoteDisplays(); return; }
    state.unsubVotes = window.Realtime.onVotes(qid, function (counts) {
      renderVoteBar(qid, counts);
      renderVoteSidePanel(qid, counts);
    });
  }

  function totalVotes(q, counts) {
    var total = 0;
    for (var i = 0; i < q.options.length; i++) total += counts[q.options[i].id] || 0;
    return total;
  }

  function renderVoteBar(qid, counts) {
    if (!voteBar) return;
    var q = findQuestion(qid);
    if (!q) { hideVoteBar(); return; }
    var total = totalVotes(q, counts);
    if (total === 0) { hideVoteBar(); return; }

    voteBar.hidden = false;
    voteBar.innerHTML = '';
    voteBar.appendChild(el('span', { cls: 'vote-bar__label', text: 'Live · ' + total + (total === 1 ? ' Stimme' : ' Stimmen') }));

    var rows = el('div', { cls: 'vote-bar__rows' });
    q.options.forEach(function (opt) {
      var count = counts[opt.id] || 0;
      var pct = total > 0 ? Math.round((count / total) * 100) : 0;
      rows.appendChild(el('div', {
        cls: 'vote-bar__option',
        children: [
          el('span', { cls: 'vote-bar__id', text: (opt.id || '').toUpperCase() }),
          el('div', {
            cls: 'vote-bar__bar',
            children: [el('div', { cls: 'vote-bar__fill', attrs: { style: 'width:' + pct + '%' } })]
          }),
          el('span', { cls: 'vote-bar__pct', text: pct + '%' }),
          el('span', { cls: 'vote-bar__count', text: '(' + count + ')' })
        ]
      }));
    });
    voteBar.appendChild(rows);
  }

  function renderVoteSidePanel(qid, counts) {
    if (!voteSidePanel) return;
    var q = findQuestion(qid);
    if (!q) { hideVoteSidePanel(); return; }
    var total = totalVotes(q, counts);
    if (total === 0) { hideVoteSidePanel(); return; }

    voteSidePanel.hidden = false;
    voteSidePanel.innerHTML = '';
    voteSidePanel.appendChild(el('div', { cls: 'vote-side-panel__title', text: 'Live-Voting' }));
    voteSidePanel.appendChild(el('div', {
      cls: 'vote-side-panel__total',
      text: total + (total === 1 ? ' Stimme' : ' Stimmen')
    }));

    var options = el('div', { cls: 'vote-side-panel__options' });
    q.options.forEach(function (opt) {
      var count = counts[opt.id] || 0;
      var pct = total > 0 ? Math.round((count / total) * 100) : 0;
      options.appendChild(el('div', {
        cls: 'vote-side-panel__option',
        children: [
          el('div', {
            cls: 'vote-side-panel__row',
            children: [
              el('span', { cls: 'vote-side-panel__id', text: (opt.id || '').toUpperCase() }),
              el('span', { cls: 'vote-side-panel__pct', text: pct + '%' })
            ]
          }),
          el('div', {
            cls: 'vote-side-panel__bar',
            children: [el('div', { cls: 'vote-side-panel__fill', attrs: { style: 'width:' + pct + '%' } })]
          }),
          el('div', {
            cls: 'vote-side-panel__count',
            text: count + (count === 1 ? ' Stimme' : ' Stimmen')
          })
        ]
      }));
    });
    voteSidePanel.appendChild(options);
  }

  function hideVoteBar() {
    if (!voteBar) return;
    voteBar.hidden = true;
    voteBar.innerHTML = '';
  }

  function hideVoteSidePanel() {
    if (!voteSidePanel) return;
    voteSidePanel.hidden = true;
    voteSidePanel.innerHTML = '';
  }

  function hideVoteDisplays() {
    hideVoteBar();
    hideVoteSidePanel();
  }

  // ─── Helpers ────────────────────────────────────────────

  function findQuestion(qid) {
    if (!state.config) return null;
    var qs = state.config.questions || [];
    for (var i = 0; i < qs.length; i++) if (qs[i].id === qid) return qs[i];
    if (state.config.tiebreaker && state.config.tiebreaker.id === qid) return state.config.tiebreaker;
    return null;
  }

  function indexOfQuestion(qid) {
    var qs = state.config.questions || [];
    for (var i = 0; i < qs.length; i++) if (qs[i].id === qid) return i;
    return -1;
  }

  function slideTransition(buildFn) {
    var old = app.querySelector('.card');
    if (!old) { app.innerHTML = ''; app.appendChild(buildFn()); return; }
    old.classList.remove('slide-in');
    old.classList.add('slide-out');
    setTimeout(function () { app.innerHTML = ''; app.appendChild(buildFn()); }, 300);
  }

  function el(tag, opts) {
    var node = document.createElement(tag);
    if (!opts) return node;
    if (opts.cls) node.className = opts.cls;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) {
      var keys = Object.keys(opts.attrs);
      for (var i = 0; i < keys.length; i++) node.setAttribute(keys[i], opts.attrs[keys[i]]);
    }
    if (opts.on) {
      var events = Object.keys(opts.on);
      for (var j = 0; j < events.length; j++) node.addEventListener(events[j], opts.on[events[j]]);
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
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
