/* Project Boreal results page: Widget 1 (comparator) and Widget 2 (dead-row census).
   Every number shown comes from data/results.json. Nothing is trained, simulated
   or interpolated here; the stage drawings are schematic. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Boreal = api;
  if (typeof document !== 'undefined') api.start(document);
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const KS = [1, 2, 4, 8, 16, 32, 64];
  const PARTS = ['DEFAULT', 'PATCHED', 'BANDED', 'SCRAMBLED'];
  // Illustrative bar lengths and threshold ticks for the schematic rows (not data).
  const ACTS = [0.42, 0.30, 0.84, 0.55, 0.26, 0.61, 0.36, 0.50];
  const THS = [0.55, 0.48, 0.52, 0.62, 0.45, 0.66, 0.50, 0.58];
  const LETTERS = 'ABCDEFGH';
  const CELLS = 64;
  const INITIAL = { ds: 'CIFAR', k: 16, ni: 4, part: 'DEFAULT' };

  // Same format codes as boreal/site_numbers.py: s/sp signed, f fixed, p percent, e exponent, i int, n grouped.
  function fmt(v, code) {
    if (!code) return String(v);
    const m = /^(sp|s|f|p)(\d)$/.exec(code);
    if (m) {
      const d = Number(m[2]);
      if (m[1] === 'f') return v.toFixed(d);
      if (m[1] === 'p') return v.toFixed(d) + '%';
      const fixed = v.toFixed(d);
      const signed = Number(fixed) === 0 ? (0).toFixed(d) : (v > 0 ? '+' : '') + fixed;
      return m[1] === 'sp' ? signed + '%' : signed;
    }
    if (code === 'e') return v.toExponential(1).replace(/e([+-])(\d)$/, 'e$10$2');
    if (code === 'i') return String(Math.trunc(v));
    if (code === 'n') return v.toLocaleString('en-US');
    throw new Error('Unknown format code: ' + code);
  }

  function lcg(seed) {
    let s = seed;
    return function () { s = (s * 16807) % 2147483647; return s; };
  }

  // Fixed shuffle of the 64 schematic cells, used to draw SCRAMBLED groupings.
  function perm64() {
    const a = [];
    for (let i = 0; i < CELLS; i++) a.push(i);
    const next = lcg(7);
    for (let i = CELLS - 1; i > 0; i--) {
      const j = next() % (i + 1);
      const x = a[i]; a[i] = a[j]; a[j] = x;
    }
    return a;
  }
  const PERM = perm64();

  // Illustrative positions for `dead` of `total` census cells; the count is data, the positions are not.
  function deadIdx(dead, total) {
    const set = {};
    const next = lcg(11);
    let n = 0;
    while (n < Math.min(dead, total)) {
      const j = next() % total;
      if (!set[j]) { set[j] = true; n++; }
    }
    return set;
  }

  function groupOf(i, k, part) {
    if (k <= 1) return 0;
    const r = Math.floor(i / 8), c = i % 8;
    if (part === 'PATCHED') {
      let gx = 1;
      while (gx * gx < k) gx *= 2;
      const gy = k / gx;
      return Math.floor(c / (8 / gx)) + gx * Math.floor(r / (8 / gy));
    }
    if (part === 'SCRAMBLED') return Math.floor(PERM[i] * k / CELLS);
    return Math.floor(i * k / CELLS);
  }

  function winner(k) { return k === 1 ? 0 : Math.min(2, k - 1); }
  function pct(x) { return Math.round(x * 100) + '%'; }

  function renderCells(k, part) {
    const win = winner(k);
    let html = '';
    for (let i = 0; i < CELLS; i++) {
      const g = groupOf(i, k, part);
      const tone = k === 1 ? 3 : g % 4;
      const letter = k > 1 && k <= 8 ? LETTERS[g] : '';
      html += '<div class="cell g' + tone + (k > 1 && g === win ? ' win' : '') + '">' + letter + '</div>';
    }
    return html;
  }

  function renderRows(k) {
    const win = winner(k);
    const rows = k === 1 ? 1 : Math.min(k, 8);
    let html = '';
    for (let i = 0; i < rows; i++) {
      const isWin = k > 1 && i === win;
      html += '<div class="grp-row' + (isWin ? ' grp-row--win' : '') + '">' +
        '<span class="grp-row__sw g' + (k === 1 ? 3 : i % 4) + '"></span>' +
        '<span class="grp-row__id">' + (k === 1 ? 'all' : LETTERS[i]) + '</span>' +
        '<span class="grp-row__track"><span class="grp-row__fill" style="width:' + pct(isWin ? 0.84 : ACTS[i]) + '"></span>' +
        '<span class="grp-row__tick" style="left:' + pct(THS[i]) + '"></span></span>' +
        '<span class="grp-row__tag">' + (isWin ? 'wins' : '') + '</span></div>';
    }
    return html;
  }

  function moreRows(k) {
    if (k === 1) return 'one threshold for all inputs';
    return k > 8 ? '+ ' + (k - 8) + ' more groups, each with its own threshold' : '';
  }

  function stageLabel(k, part) {
    return 'SCHEMATIC · ' + (k === 1 ? 'MODEL I, ONE THRESHOLD' : 'MODEL III, K=' + k + ', ' + part);
  }

  function stageCaption(k, part) {
    if (k === 1) return 'Model I: all inputs, one threshold.';
    let text = 'hard max: strongest group wins; groups do not pool evidence.';
    if (part === 'SCRAMBLED') text += ' Under SCRAMBLED, group membership is shuffled across the grid.';
    if (part === 'BANDED') text += ' BANDED uses full-width bands across all three channels; they look like DEFAULT in this single-plane schematic.';
    return text;
  }

  function gridOf(ds, data) { return ds === 'CIFAR' ? data.cifar.n : data.mnist.n; }

  // Recorded delta vs the parameter-matched MLP for (dataset, K, N), or undefined if none was recorded.
  function deltaOf(ds, k, n, data) {
    if (ds === 'CIFAR') return (data.cifar.delta[k] || {})[n];
    const series = { 2: data.mnist.delta_k2, 4: data.mnist.delta_k4 }[k];
    return series ? series[n] : undefined;
  }

  function sourceLine(ds, k, data) {
    if (ds === 'MNIST') {
      return 'Exp 1 · ' + data.mnist.trials + '/' + data.mnist.trials + ' trials · MLP tops at ' + fmt(data.mnist.mlp_top, 'f4');
    }
    const exp = k <= 4 ? 'Exp 3' : k <= 16 ? 'Exp 3b' : 'Exp 3c';
    return exp + ' · CIFAR-10, no convolution · MLP tops at ' + fmt(data.cifar.mlp_top, 'f4');
  }

  function isPeak(ds, k, n, data) {
    const grid = gridOf(ds, data);
    const vals = grid.map(function (x) { return deltaOf(ds, k, x, data); }).filter(function (v) { return v !== undefined; });
    return deltaOf(ds, k, n, data) === Math.max.apply(null, vals);
  }

  function isGridMax(v, data) {
    let max = -Infinity;
    Object.keys(data.cifar.delta).forEach(function (k) {
      Object.keys(data.cifar.delta[k]).forEach(function (n) { max = Math.max(max, data.cifar.delta[k][n]); });
    });
    return v === max;
  }

  function partitionPanel(part, data) {
    const P = data.partition, T = P.tests;
    const test = function (name, t) { return name + ' ' + fmt(t.diff, 's4') + ' (p=' + fmt(t.p, 'e') + ')'; };
    if (part === 'DEFAULT') {
      const t = data.cifar.tests.k16_vs_k8_10000;
      return {
        icon: '▲', value: fmt(P.delta.DEFAULT, 's4'),
        sub: 'vs parameter-matched MLP' + (isGridMax(P.delta.DEFAULT, data) ? ' · largest on the K × N grid' : ''),
        lines: [
          'DEFAULT (contiguous slices) accuracy ' + fmt(P.acc.DEFAULT, 'f4') + ' · MLP ' + fmt(P.acc.MLP, 'f4'),
          'K16 > K8 at N=' + P.n + ': ' + fmt(t.diff, 's4') + ', p=' + fmt(t.p, 'e'),
        ],
      };
    }
    if (part === 'PATCHED') {
      return {
        icon: '', value: fmt(P.acc.PATCHED, 'f4'),
        sub: 'mean accuracy · PATCHED (8×8 spatial blocks) · ' + fmt(P.delta.PATCHED, 's4') + ' vs MLP',
        lines: [test('PATCHED > DEFAULT', T.patched_vs_default), test('PATCHED > BANDED', T.patched_vs_banded) + ': the only fully controlled comparison'],
      };
    }
    if (part === 'SCRAMBLED') {
      return {
        icon: '', value: fmt(P.acc.SCRAMBLED, 'f4'),
        sub: 'mean accuracy · spatial structure destroyed',
        lines: [
          'SCRAMBLED is ' + fmt(T.scrambled_vs_mlp.diff, 's4') + ' above MLP (p=' + fmt(T.scrambled_vs_mlp.p, 'e') + ')',
          test('DEFAULT > SCRAMBLED', T.default_vs_scrambled),
        ],
      };
    }
    return {
      icon: '', value: fmt(P.acc.BANDED, 'f4'),
      sub: 'mean accuracy · BANDED (2-row full-width bands)',
      lines: [test('BANDED > DEFAULT', T.banded_vs_default) + ' (confounded with vertical extent)', test('PATCHED > BANDED', T.patched_vs_banded)],
    };
  }

  function isPartitionCell(s, data) { return s.ds === 'CIFAR' && s.k === data.partition.k && s.n === data.partition.n; }

  // The test behind a panel's numbers, as each gate report records it: Exp 1 Welch uncorrected,
  // Exp 3 Welch + Holm, the 3b-3e orderings and partitions paired + Holm; K8+ deltas vs MLP untested.
  function methodLine(s, sig, data) {
    const seeds = data.meta.seeds + ' seeds';
    if (s.k === 1) return seeds;
    if (s.ds === 'MNIST') return seeds + ' · Welch t-test vs MLP, uncorrected';
    if (isPartitionCell(s, data)) return seeds + ' · paired t-tests, Holm-Bonferroni';
    if (sig !== undefined) return seeds + ' · Welch t-test vs MLP, Holm-Bonferroni';
    return seeds + ' · no significance test vs MLP at this K';
  }

  // Panel content for one widget state {ds, k, n, part}. Pure: same input, same output.
  function buildPanel(s, data) {
    const isCifar = s.ds === 'CIFAR';
    const dn = isCifar ? 'CIFAR-10' : 'MNIST';
    const ns = s.n.toLocaleString('en-US');
    if (s.k === 1) {
      return {
        cls: 'panel--base', head: dn + ' · Model I (MLP) · N=' + ns, icon: '', value: 'baseline',
        sub: 'Model I is the reference: one threshold per neuron. Every delta here is Model III minus this parameter-matched MLP.',
        lines: [isCifar
          ? 'CIFAR-10 MLP (no convolution) tops at ' + fmt(data.cifar.mlp_top, 'f4') + '.'
          : 'MNIST MLP tops at ' + fmt(data.mnist.mlp_top, 'f4') + ' (~' + fmt(data.mnist.mlp_top, 'f2') + ' ceiling).'],
        isLow: false, params: 'none (one threshold per neuron)', source: methodLine(s, undefined, data),
      };
    }
    const extra = isCifar ? data.cifar.extra_params[s.k] : undefined;
    const base = {
      head: dn + ' · K=' + s.k + ' · N=' + ns + (s.part !== 'DEFAULT' ? ' · ' + s.part : ''),
      isLow: false,
      params: extra ? fmt(extra.pct, 'sp3') : 'not in this summary',
    };
    const grey = function (sub, lines) {
      return Object.assign(base, { cls: 'panel--grey', icon: '', value: 'not measured', sub: sub, lines: lines, source: '' });
    };
    if (isPartitionCell(s, data)) return Object.assign(base, { cls: 'panel--measured', source: methodLine(s, undefined, data) }, partitionPanel(s.part, data));
    if (s.part !== 'DEFAULT') {
      return grey('Partition comparison measured only at K=' + data.partition.k + ', N=' + data.partition.n.toLocaleString('en-US') + '.',
        ['The schematic re-draws the grouping; no number is shown for this cell.']);
    }
    const v = deltaOf(s.ds, s.k, s.n, data);
    if (v === undefined) return grey('Not run in any recorded experiment. No estimate is shown.', []);

    const isLow = s.n === gridOf(s.ds, data)[0] && v < 0;
    let sub = 'vs parameter-matched MLP';
    const sig = isCifar ? (data.cifar.exp3_holm_sig[s.k] || {})[s.n] : undefined;
    if (sig !== undefined) sub += ' · ' + (sig ? 'Holm-significant' : 'not significant (ns)');
    if (!isCifar && isPeak(s.ds, s.k, s.n, data)) sub += ' · peak';
    return Object.assign(base, {
      cls: isLow ? 'panel--low' : 'panel--measured',
      icon: v > 0 ? '▲' : v < 0 ? '▼' : '',
      value: fmt(v, !isCifar && isLow ? 's3' : 's4'),
      sub: sub, lines: [sourceLine(s.ds, s.k, data)], isLow: isLow, source: methodLine(s, sig, data),
    });
  }

  function initW1(doc, data) {
    const root = doc.getElementById('widget1');
    const el = function (id) { return doc.getElementById(id); };
    const state = Object.assign({}, INITIAL);
    const effPart = function () { return state.k === 1 ? 'DEFAULT' : state.part; };
    const buttons = function (attr) { return Array.prototype.slice.call(root.querySelectorAll('[' + attr + ']')); };
    // The panel is a polite live region: writing only what changed keeps announcements to the change.
    const setText = function (id, value) { if (el(id).textContent !== value) el(id).textContent = value; };
    let live = false;

    function setDisabled() {
      ['data-arch', 'data-k', 'data-ds', 'data-ni'].forEach(function (attr) {
        buttons(attr).forEach(function (b) { b.disabled = !live; });
      });
      buttons('data-part').forEach(function (b) { b.disabled = !live || state.k === 1; });
    }

    function render() {
      const grid = gridOf(state.ds, data);
      const part = effPart();
      const p = buildPanel({ ds: state.ds, k: state.k, n: grid[state.ni], part: part }, data);
      el('w1-panel').className = 'panel ' + p.cls;
      setText('w1-head', p.head);
      setText('w1-value', (p.icon ? p.icon + ' ' : '') + p.value);
      setText('w1-sub', p.sub);
      const lines = el('w1-lines');
      const shown = Array.prototype.map.call(lines.children, function (div) { return div.textContent; });
      if (shown.join('\n') !== p.lines.join('\n')) {
        lines.textContent = '';
        p.lines.forEach(function (text) {
          const div = doc.createElement('div');
          div.textContent = text;
          lines.appendChild(div);
        });
      }
      el('w1-low').hidden = !p.isLow;
      setText('w1-params', p.params);
      setText('w1-src', p.source);
      el('w1-src').hidden = !p.source;

      el('w1-stage-label').textContent = stageLabel(state.k, part);
      el('w1-cells').innerHTML = renderCells(state.k, part);
      el('w1-rows').innerHTML = renderRows(state.k);
      el('w1-more').textContent = moreRows(state.k);
      el('w1-caption-lead').textContent = stageCaption(state.k, part);

      buttons('data-arch').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.arch === 'I') === (state.k === 1))); });
      buttons('data-k').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.k) === state.k)); });
      buttons('data-part').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.part === part)); });
      buttons('data-ds').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ds === state.ds)); });
      buttons('data-ni').forEach(function (b) {
        const i = Number(b.dataset.ni);
        b.textContent = grid[i].toLocaleString('en-US');
        b.setAttribute('aria-pressed', String(i === state.ni));
      });
      setDisabled();
    }

    const on = function (attr, apply) {
      buttons(attr).forEach(function (b) {
        b.addEventListener('click', function () { apply(b.getAttribute(attr)); render(); });
      });
    };
    on('data-arch', function (v) { state.k = v === 'I' ? 1 : (state.k > 1 ? state.k : 2); });
    on('data-k', function (v) { state.k = Number(v); });
    on('data-part', function (v) { state.part = v; });
    on('data-ds', function (v) { state.ds = v; });
    on('data-ni', function (v) { state.ni = Number(v); });
    render();
    // Controls come on only after the first render succeeds; a failed render leaves the static page and its controls off.
    live = true;
    setDisabled();
  }

  function initW2(doc, data) {
    const rows = data.exp2.dead_rows;
    const dead = deadIdx(rows.dead, rows.total);
    let deadHtml = '', softHtml = '';
    for (let i = 0; i < rows.total; i++) {
      deadHtml += dead[i] ? '<span class="dead"></span>' : '<span></span>';
      softHtml += '<span></span>';
    }
    doc.getElementById('w2-dead').innerHTML = deadHtml;
    doc.getElementById('w2-soft').innerHTML = softHtml;
  }

  // Structured error event on the console; the page logs nothing else.
  function logError(message, err) {
    if (typeof console !== 'undefined') console.error(JSON.stringify({ level: 'error', message: message, context: { error: String(err) } }));
  }

  function start(doc) {
    if (!doc.getElementById('widget1') || typeof fetch !== 'function') return;
    fetch('data/results.json')
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        initW2(doc, data);
        initW1(doc, data);
      })
      .catch(function (err) {
        logError('interactive widgets did not start', err);
        const note = doc.getElementById('w1-load-note');
        if (note) note.hidden = false;
      });
  }

  return {
    KS: KS, PARTS: PARTS, INITIAL: INITIAL,
    fmt: fmt, perm64: perm64, deadIdx: deadIdx, groupOf: groupOf,
    renderCells: renderCells, renderRows: renderRows, moreRows: moreRows,
    stageLabel: stageLabel, stageCaption: stageCaption,
    buildPanel: buildPanel, start: start,
  };
});
