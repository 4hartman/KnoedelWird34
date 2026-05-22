(function () {
  'use strict';

  var SESSION_PATH = 'sessions/default';

  var ready = false;
  var db = null;
  var stateRef = null;
  var votesRef = null;

  function configLooksValid() {
    var c = window.FIREBASE_CONFIG;
    if (!c) return false;
    var keys = ['apiKey', 'databaseURL', 'projectId', 'appId'];
    for (var i = 0; i < keys.length; i++) {
      var v = c[keys[i]];
      if (!v || typeof v !== 'string') return false;
      if (v.indexOf('PASTE') !== -1) return false;
    }
    return true;
  }

  function init() {
    if (ready) return Promise.resolve(true);

    if (!window.firebase) {
      console.warn('[realtime] Firebase SDK missing — running in local-only mode.');
      return Promise.resolve(false);
    }
    if (!configLooksValid()) {
      console.warn('[realtime] Firebase config has placeholders — running in local-only mode. See firebase-config.js for setup.');
      return Promise.resolve(false);
    }

    try {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(window.FIREBASE_CONFIG);
      }
    } catch (e) {
      console.warn('[realtime] Firebase init failed', e);
      return Promise.resolve(false);
    }

    return window.firebase.auth().signInAnonymously()
      .then(function () {
        db = window.firebase.database();
        stateRef = db.ref(SESSION_PATH + '/state');
        votesRef = db.ref(SESSION_PATH + '/votes');
        ready = true;
        return true;
      })
      .catch(function (err) {
        console.warn('[realtime] anonymous auth failed', err);
        return false;
      });
  }

  function isReady() { return ready; }

  function onState(cb) {
    if (!ready) return function () {};
    var handler = stateRef.on('value', function (snap) { cb(snap.val()); });
    return function () { stateRef.off('value', handler); };
  }

  function setState(partial) {
    if (!ready) return Promise.resolve();
    var payload = Object.assign({}, partial, {
      updatedAt: window.firebase.database.ServerValue.TIMESTAMP
    });
    return stateRef.update(payload).catch(function (err) {
      console.warn('[realtime] setState failed', err);
    });
  }

  function resetSession() {
    var gameId = String(Date.now());
    if (!ready) return Promise.resolve(gameId);
    return Promise.all([
      votesRef.set(null),
      stateRef.set({
        phase: 'intro',
        questionId: null,
        revealKey: null,
        gameId: gameId,
        updatedAt: window.firebase.database.ServerValue.TIMESTAMP
      })
    ])
      .then(function () { return gameId; })
      .catch(function (err) {
        console.warn('[realtime] resetSession failed', err);
        return gameId;
      });
  }

  function onVotes(questionId, cb) {
    if (!ready || !questionId) return function () {};
    var ref = votesRef.child(questionId);
    var handler = ref.on('value', function (snap) { cb(snap.val() || {}); });
    return function () { ref.off('value', handler); };
  }

  function castVote(questionId, optionId) {
    if (!ready) return Promise.resolve(false);
    var ref = votesRef.child(questionId).child(optionId);
    return ref.transaction(function (current) {
      return (typeof current === 'number' ? current : 0) + 1;
    })
      .then(function () { return true; })
      .catch(function (err) {
        console.warn('[realtime] castVote failed', err);
        return false;
      });
  }

  window.Realtime = {
    init: init,
    isReady: isReady,
    onState: onState,
    setState: setState,
    resetSession: resetSession,
    onVotes: onVotes,
    castVote: castVote
  };
})();
